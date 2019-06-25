import chalk from "chalk";
import * as azure from "ms-rest-azure";
import * as rm from "azure-arm-resource";
import * as storage from "azure-arm-storage";
import * as monitor from "azure-arm-monitor";
import * as website from "azure-arm-website";
import * as container from "azure-arm-containerregistry";
import alertTemplate from "./templates/ErrorLogAlert.json";
import actionGroupTemplate from "./templates/CreateActionGroup.json";
import * as moment from 'moment';
import { RigParameters } from "./types/parameters";


export default class {
  private credentials: any;

  constructor(private rigParams: RigParameters) {}

  async azureLogin() {
    console.log(chalk.blueBright("Logging into Azure"));
    const opts = {
      domain: this.rigParams.azResources.tenantId
    };
   
    this.credentials = await azure.interactiveLogin(opts);
    console.log(chalk.green("Successfully Logged into Azure"));
  }

  async createCommonResourceGroup() {
    try{
      console.log(chalk.blueBright("Creating Common Resource Group"));

      var groupParameters = {
        location: this.rigParams.azResources.location
      };

      let resourceClient = new rm.ResourceManagementClient.ResourceManagementClient(this.credentials,
        this.rigParams.azResources.subscription);

      //Create ResourceGroup
      var results = await resourceClient.resourceGroups.createOrUpdate(
        this.rigParams.azResources.baseResourceGroupName,
        groupParameters
      );

      //Save ResourceGroupId
      this.rigParams.azResources.resourceGroupId = results.id || "";

      console.log(chalk.green("Created Common Resource Group in Azure"));
    }catch(err){
      console.log(chalk.red("Error created Common Resource Group in Azure"));
      console.log(err);
    }

    //Add Storage Account
    await this.createCommonStorageAccount();

    //Add Container Registry
    await this.createCommonContainerRegistry();

    //Add Slack Notification Function App
    await this.createFunctionApp();
  }

  async createCommonStorageAccount() {
    try {
      console.log(chalk.blueBright("Creating Common Storage Account in Azure"));

      const client = new storage.StorageManagementClient(
        this.credentials,
        this.rigParams.azResources.subscription
      );
      const createParams = {
        location: this.rigParams.azResources.location,
        kind: "Storage",
        sku: {
          name: "Standard_LRS"
        }
      };

      await client.storageAccounts.create(
        this.rigParams.azResources.baseResourceGroupName,
        this.rigParams.azResources.storageAccountName,
        createParams
      );

      let keysResult = await client.storageAccounts.listKeys(
        this.rigParams.azResources.baseResourceGroupName,
        this.rigParams.azResources.storageAccountName
      );
      let key: string = "";
      if (keysResult && keysResult.keys && keysResult.keys[0].value) {
        key = keysResult.keys[0].value;
      }
      this.rigParams.azResources.storageAccountKey = key;

      console.log(chalk.green("Created Common Storage Account"));
    } catch (err) {
      console.log(chalk.redBright("Error creating Storage Account"));
      console.log(err);
    }
  }

  async createCommonContainerRegistry() {
    try {
      console.log(chalk.blueBright("Creating Container Registry"));

      const manager = new container.ContainerRegistryManagementClient(
        this.credentials,
        this.rigParams.azResources.subscription
      );

      const opts = {
        sku: {
          name: "Basic"
        },
        location: this.rigParams.azResources.location,
        adminUserEnabled: true
      };

      await manager.registries.create(
        this.rigParams.azResources.baseResourceGroupName,
        this.rigParams.azResources.containerRegistryName,
        opts
      );
      console.log(chalk.green("Created Container Registry"));
    } catch (err) {
      console.log(chalk.redBright("Error creating container registry"));
      console.log(err);
    }
  }

  async createFunctionApp(){
    try{
      console.log(chalk.blueBright("Creating Slack Function App"));

      let client = new website.WebSiteManagementClient(this.credentials,
        this.rigParams.azResources.subscription);

      let site : website.WebSiteManagementModels.Site= {
        kind: "functionapp",
        location: this.rigParams.azResources.location,
        enabled: true
      };

      await client.webApps.createOrUpdate(this.rigParams.azResources.baseResourceGroupName, this.rigParams.azResources.slackFuncName,  site);

    }catch(err){
      console.log(chalk.redBright("Error creating Slack Function App"));
      console.log(err);
    }
  }

  async createActionGroup(){
    try{
      console.log(chalk.blueBright("Creating Action Group"));

      let tokenReplacedTemplate = JSON.stringify(actionGroupTemplate)
                                      .replaceAll("${actionGroupName}", `${this.rigParams.azResources.baseResourceGroupName}AG`)
                                      .replaceAll("${slackFunc}", this.rigParams.azResources.slackFuncName)
                                      .replaceAll("${subscriptionId}", this.rigParams.azResources.subscription)
                                      .replaceAll("${resourceGroup}", this.rigParams.azResources.baseResourceGroupName);

      const client = new monitor.MonitorManagementClient(
        this.credentials,
        this.rigParams.azResources.subscription
      );

      await client.actionGroups.createOrUpdate(this.rigParams.azResources.baseResourceGroupName, "SlackHookError", JSON.parse(tokenReplacedTemplate));

      console.log(chalk.green("Created Action Group"));
    }catch(err){
      console.log(chalk.redBright("Error creating Action Group"));
      console.log(err);
    }
  }

  async createLogAlert() {
    try {
      console.log(chalk.blueBright("Creating Alert"));

      const client = new monitor.MonitorManagementClient(
        this.credentials,
        this.rigParams.azResources.subscription
      );

      let tokenReplacedTemplate = JSON.stringify(alertTemplate)
        .replaceAll(
          "${subscriptionId}",
          this.rigParams.azResources.subscription
        )
        .replaceAll(
          "${resourceGroup}",
          `${this.rigParams.azResources.baseResourceGroupName}Dev`
        )
        .replaceAll(
          "${appInsightsName}",
          `${this.rigParams.azResources.getAppName("Dev")}-appinsights`
        )
        .replaceAll("${commonResourceGroup}", this.rigParams.azResources.baseResourceGroupName)
        .replaceAll("${actionGroupName}", "SlackHookError")
        .replaceAll("${location}", this.rigParams.azResources.location);
        
        let payload =  JSON.parse(tokenReplacedTemplate);
        payload.evaluationFrequency = moment.duration(5, 'minutes');
        payload.windowSize = moment.duration(5, 'minutes');
  

      await client.metricAlerts.createOrUpdate(
        `${this.rigParams.azResources.baseResourceGroupName}Dev`,
        "ErrorLogAlert",
        payload
      );

      console.log(chalk.green("Created Alert"));
    } catch (err) {
      console.log(chalk.redBright("Error creating alert"));
      console.log(err);
    }
  }
}
