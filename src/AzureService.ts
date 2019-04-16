import * as azure from "ms-rest-azure";
import * as rm from "azure-arm-resource";
import * as storage from "azure-arm-storage";
import * as container from "azure-arm-containerregistry";

export default class {
  private credentials: any;

  constructor(
    private username: string,
    private password: string,
    private subscriptionId: string
  ) {
    //this.azureLogin();
  }

  async azureLogin() {
    const opts = {
      domain: "1a6dbb80-5290-4fd1-a938-0ad7795dfd7a"
    };
    this.credentials = await azure.interactiveLogin(opts);
    //await azure.loginWithUsernamePassword(this.username, this.password, opts);
  }

  async createCommonResourceGroup() {
    var groupParameters = {
      location: "centralus"
    };

    let resourceClient = new rm.ResourceManagementClient(
      this.credentials,
      this.subscriptionId
    );

    //Create ResourceGroup
    await resourceClient.resourceGroups.createOrUpdate(
      "TestGroup",
      groupParameters
    );

    //Add Storage Account
    await this.createCommonStorageAccount();

    //Add Container Registry
    await this.createCommonContainerRegistry();
  }

  async createCommonStorageAccount() {
    const client = new storage.StorageManagementClient(
      this.credentials,
      this.subscriptionId
    );
    const createParams = {
      location: "centralus",
      kind: "Storage",
      sku: {
        name: "Standard_LRS"
      }
    };
    await client.storageAccounts.create("TestGroup", "rigstg", createParams);
  }

  async createCommonContainerRegistry() {
    const manager = new container.ContainerRegistryManagementClient(
      this.credentials,
      this.subscriptionId
    );

    const opts = {
        sku: {
            name: "Basic"
        },
        location: "centralus"
    };

    await manager.registries.create("TestGroup", "TestGroupRegistry", opts);
  }
}
