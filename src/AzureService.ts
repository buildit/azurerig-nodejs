
import chalk from "chalk";
import * as azure from "ms-rest-azure";
import * as rm from "azure-arm-resource";
import * as storage from "azure-arm-storage";
import * as container from "azure-arm-containerregistry";
import { RigParameters } from "./types/parameters";

export default class {
  private credentials: any;

  constructor(
    private rigParams: RigParameters
  ) {
  }

  async azureLogin() {
    console.log(chalk.blueBright("Logging into Azure"));
    const opts = {
      domain: "1a6dbb80-5290-4fd1-a938-0ad7795dfd7a"
    };
    this.credentials = await azure.interactiveLogin(opts);
    console.log(chalk.green("Successfully Logged into Azure"));
  }

  async createCommonResourceGroup() {
    console.log(chalk.blueBright("Creating Common Resource Group"));

    var groupParameters = {
      location: this.rigParams.azResources.location
    };

    let resourceClient = new rm.ResourceManagementClient(
      this.credentials,
      this.rigParams.azResources.subscription
    );

    //Create ResourceGroup
    var results = await resourceClient.resourceGroups.createOrUpdate(
      this.rigParams.azResources.baseResourceGroupName,
      groupParameters
    );

    //Save ResourceGroupId
    this.rigParams.azResources.resourceGroupId = results.id || "";

    console.log(chalk.green("Created Common Resource Group in Azure"));
    
    //Add Storage Account
    await this.createCommonStorageAccount();

    //Add Container Registry
    await this.createCommonContainerRegistry();
  }

  async createCommonStorageAccount() {
    try
    {
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
    
    await client.storageAccounts.create(this.rigParams.azResources.baseResourceGroupName, this.rigParams.azResources.storageAccountName, createParams);

    let keysResult = await client.storageAccounts.listKeys(this.rigParams.azResources.baseResourceGroupName, this.rigParams.azResources.storageAccountName);
    let key: string = "";
    if(keysResult && keysResult.keys && keysResult.keys[0].value){
      key = keysResult.keys[0].value;
    } 
    this.rigParams.azResources.storageAccountKey = key;

    console.log(chalk.green("Created Common Storage Account"));
  }
    catch(err){
      console.log(chalk.redBright("Error creating Storage Account"));
      console.log(err);
    }
  }

  async createCommonContainerRegistry() {
    try{
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

    await manager.registries.create(this.rigParams.azResources.baseResourceGroupName, this.rigParams.azResources.containerRegistryName, opts);
    console.log(chalk.green("Created Container Registry"));

  }
  catch(err){
    console.log(chalk.redBright("Error creating container registry"));
    console.log(err);
  }
  }
}
