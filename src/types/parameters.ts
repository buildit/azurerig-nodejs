import { stringify } from "querystring";

export class RigParameters {
  constructor(
    public azResources: AzResources,
    public azDevOps: AzDevOps,
    public gitParams: GitParams
  ) {}
}

export class AzResources {
  private _resourceGroupId: string = "";
  private _storageAccountKey: string = "";

  get storageAccountName(): string {
    return `${this.baseResourceGroupName.toLocaleLowerCase()}stgacct`;
  }

  get storageAccountBaseUrl(): string {
    return `https://${this.storageAccountName}.blob.core.windows.net/`
  }

  get containerRegistryName(): string {
    return `${this.baseResourceGroupName}ContainerRegistry`.toLocaleLowerCase();
  }

  get containeRegistryAddress(): string {
      return `${this.containerRegistryName}.azurecr.io`.toLocaleLowerCase();
  }

  set resourceGroupId(value: string){
    this._resourceGroupId = value;
  }

  get resourceGroupId(): string {
    return this._resourceGroupId;
  }

  get storageAccountKey(): string {
    return this._storageAccountKey;
  }

  set storageAccountKey(value: string){
    this._storageAccountKey = value;
  }

  get baseAppName(): string{
    return `${this.baseAppName}AppService`;
  }

  getAppName(stage: string): string {
    return `${this.baseAppName}${stage}`;
  }

  getAppUrl(stage: string): string{
    return `https://${this.getAppName(stage)}.azurewebsites.net/`;
  }

  constructor(
    public tenantId: string,
    public subscription: string,
    public baseResourceGroupName: string,
    public appServiceName: string,
    public location: string
  ) {}
}

export class AzDevOps {
  private _projectId: string = "";
  private _serviceConnectionId: string = "";
  private _gitServiceConnectionId: string = "";
  private _devBuildPipelineId: number = -1;
  private _devAgentQueueId: number = -1;
  private _masterBuildPipelineId: number = -1;
  private _masterAgentQueueId: number = -1;
  private _pipelineOwner: string = "";

  get projectId(): string {
    return this._projectId;
  }

  set projectId(value: string) {
    this._projectId = value;
  }

  get serviceConnectionId(): string {
    if(this._serviceConnectionId === ""){
        throw new Error("ServiceConnection has not been set");
    }
    return this._serviceConnectionId;
  }

  set serviceConnectionId(id: string) {
    this._serviceConnectionId = id;
  }

  get gitServiceConnectionId(): string {
    return this._gitServiceConnectionId;
  }

  set gitServiceConnectionId(id: string){
    this._gitServiceConnectionId = id;
  }

  get devBuildPipelineId(): number{
    return this._devBuildPipelineId;
  }

  set devBuildPipelineId(value: number){
    this._devBuildPipelineId = value;
  }

  get devAgenetQueueId(): number{
    return this._devAgentQueueId;
  }

  set devAgentQueueId(value: number){
    this._devAgentQueueId = value;
  }

  get masterBuildPipelineId():number{
    return this._masterBuildPipelineId;
  }

  set masterBuildPipelineId(value:number){
    this._masterBuildPipelineId = value;
  }

  get masterAgentQueueId(): number{
    return this._masterAgentQueueId;
  }

  set masterAgenetQueueId(value: number){
    this._masterAgentQueueId = value;
  }

  get pipelineOwner(): string{
    return this._pipelineOwner;
  }


  set pipelineOwner(value:string){
    this._pipelineOwner = value;
  }

 

  constructor(
    public username: string,
    public pat: string,
    public orgName: string,
    public projName: string
  ) {}
}

export class GitParams {
  constructor(public pat: string, public org: string, public repo: string) {}
}
