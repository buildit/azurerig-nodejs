import chalk from "chalk";
import * as azdev from "azure-devops-node-api";
import * as coreInterfaces from "azure-devops-node-api/interfaces/CoreInterfaces";
import * as graphInterfaces from "azure-devops-node-api/interfaces/GraphInterfaces";
import { AzDevOps, RigParameters } from "./types/parameters";
import * as createBuildDefTemplate from "./templates/createBuildPipeline.json";
import * as createReleaseDefTemplate from "./templates/CreateReleasePipeline.json";
import * as createProdReleaseDefTemplate from "./templates/createProdReleasePipeline.json";
import * as createInfrastructurePipeline from "./templates/createInfrastructurePipeline.json";
import "./extensions/string.extensions";
import { IBuildApi } from "azure-devops-node-api/BuildApi";
import { OperationReference } from "azure-devops-node-api/interfaces/common/OperationsInterfaces";
import { ICoreApi } from "azure-devops-node-api/CoreApi";
import { BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";

export default class {
  private connection: azdev.WebApi;

  constructor(private params: RigParameters) {
    let authHandler = azdev.getPersonalAccessTokenHandler(params.azDevOps.pat);
    this.connection = new azdev.WebApi(params.azDevOps.orgName, authHandler);
    console.log(params.azDevOps.pat)
    console.log(params.azDevOps.orgName)
  }

  async createProject(projectName: string) {
    try{
    console.log(chalk.blueBright("Creating Azure DevOps Project"));
    let core = await this.connection.getCoreApi();
  
    const projectToCreate: coreInterfaces.TeamProject = {
      name: projectName,
      description: "",
      visibility: coreInterfaces.ProjectVisibility.Private,
      capabilities: {
        versioncontrol: { sourceControlType: "Git" },
        processTemplate: {
          templateTypeId: "6b724908-ef14-45cf-84f8-768b5384da45"
        }
      }
    };
    await core.queueCreateProject(projectToCreate);

    let project = await this.pollForNewProject(projectName);

    this.params.azDevOps.projectId = project!.id || "";
    console.log(chalk.green("Created Azure DevOps Project"));
  }catch(err){
      console.log(chalk.red("Error Creating Azure DevOps Project"));
      console.log(err);
    }
  }


  async createDevBuildPipeline() {
    var tokenReplacedTemplate = JSON.stringify(createBuildDefTemplate)
    .replaceAll("${branch}", "dev")
    .replaceAll("${imageName}", this.params.azResources.baseResourceGroupName.toLocaleLowerCase())
    .replaceAll("${serviceConnectionId}", this.params.azDevOps.serviceConnectionId)
    .replaceAll("${registryAddress}", this.params.azResources.containeRegistryAddress)
    .replaceAll("${imageTag}", "unstable-")
    .replaceAll("${gitOrg}", "BuildIt")
    .replaceAll("${gitRepo}", "slackbot")
    .replaceAll("${gitServiceConnectionId}", this.params.azDevOps.gitServiceConnectionId)
    .replaceAll("${orgName}", this.params.azDevOps.orgName)
    .replaceAll("${pipelineId}", this.params.azDevOps.devBuildPipelineId.toString())
    .replaceAll("${sourcePipelineName}", `${this.params.azResources.baseResourceGroupName} Dev`)
    .replaceAll("${pipelineName}", `${this.params.azResources.baseResourceGroupName} Dev`)
    .replaceAll("${projectId}", this.params.azDevOps.projectId)
    .replaceAll("${projectName}", this.params.azDevOps.projName)
    .replaceAll("${storageAccountName}", this.params.azResources.storageAccountName)
    .replaceAll("${storageAccountUrl}", this.params.azResources.storageAccountBaseUrl + "dev-test-results")
    .replaceAll("${storageAccountKey}", this.params.azResources.storageAccountKey);  

    let result = await this.createBuildPipeline(tokenReplacedTemplate);


    this.params.azDevOps.devBuildPipelineId = result.id || -1;
    this.params.azDevOps.devAgentQueueId = (result.queue && result.queue.id) ? result.queue.id : -1;
    this.params.azDevOps.pipelineOwner = (result.authoredBy && result.authoredBy.id) ? result.authoredBy.id : "error";

    console.log(`Dev Build PipelineId: ${this.params.azDevOps.devBuildPipelineId}`);
    console.log(`Pipeline Owner: ${this.params.azDevOps.pipelineOwner}`);
    console.log(`Dev Buile Pipeline AgentQueueId ${this.params.azDevOps.devAgenetQueueId}`);
  }

  async createMasterBuildPipeline(){
    var tokenReplacedTemplate = JSON.stringify(createBuildDefTemplate)
    .replaceAll("${branch}", "master")
    .replaceAll("${imageName}", this.params.azResources.baseResourceGroupName.toLocaleLowerCase())
    .replaceAll("${serviceConnectionId}", this.params.azDevOps.serviceConnectionId)
    .replaceAll("${registryAddress}", this.params.azResources.containeRegistryAddress)
    .replaceAll("${imageTag}", "")
    .replaceAll("${gitOrg}", "BuildIt")
    .replaceAll("${gitRepo}", "slackbot")
    .replaceAll("${gitServiceConnectionId}", this.params.azDevOps.gitServiceConnectionId)
    .replaceAll("${orgName}", this.params.azDevOps.orgName)
    .replaceAll("${pipelineName}", `${this.params.azResources.baseResourceGroupName} Master`)
    .replaceAll("${projectId}", this.params.azDevOps.projectId)
    .replaceAll("${projectName}", this.params.azDevOps.projName)
    .replaceAll("${storageAccountName}", this.params.azResources.storageAccountName)
    .replaceAll("${storageAccountUrl}", this.params.azResources.storageAccountBaseUrl + "prod-test-results")
    .replaceAll("${storageAccountKey}", this.params.azResources.storageAccountKey);  

    let result = await this.createBuildPipeline(tokenReplacedTemplate);
    this.params.azDevOps.masterAgenetQueueId = (result.queue && result.queue.id) ? result.queue.id : -1;

    this.params.azDevOps.masterBuildPipelineId = result.id || -1;
  }

  private async createBuildPipeline(parameterizedTempalate:string): Promise<BuildDefinition> {
    try {
      console.log(chalk.blueBright("Creating Build Pipeline"));
      let build : IBuildApi = await this.connection.getBuildApi();

      var temp = JSON.parse(parameterizedTempalate);

       var result = await build.createDefinition(<any>temp, this.params.azDevOps.projName);

       console.log(chalk.green("Created Build Pipeline"));
       return result;
    } catch (err) {
      console.log(err);
      if(err.result.typeKey == "InvalidProjectException"){
        console.log(chalk.yellow("Azure DevOps project still being provisioned"));
        return await this.createBuildPipeline(parameterizedTempalate);
      }else if(err.result.typeKey == "PipelineValidationException" && err.result.message.includes(this.params.azDevOps.serviceConnectionId)){
        console.log(chalk.yellow("Service Connection is still being provisioned"));
        return await this.createBuildPipeline(parameterizedTempalate);
      }else {
        console.log(chalk.red("Error creating build pipeline"));
        console.log(err);
        throw err("Error creating Build Pipeline");
      }
    }
  }

  async pollForNewProject(projectName: string) : Promise<coreInterfaces.TeamProject | undefined> {
        try{
          console.log(chalk.blueBright("Polling for Newly Created Project"));
        
          const maxLoops: number = 500;
          let core : ICoreApi = await this.connection.getCoreApi();
          let project: coreInterfaces.TeamProject | undefined;
        
          let numLoops = 0;
          while (numLoops < maxLoops) {
              console.log(chalk.yellow(`Waiting for project creation to complete, loopnum ${numLoops}`))
              project = await core.getProject(projectName);
              numLoops += 1;
              if (project) {
                  break;
              }
          }


          console.log(chalk.green(`Found New Project ${projectName} id:${project!.id as string}`));
          return project;
      }catch(err){
        console.log(chalk.red("Error while polling for new project"));
      }
  }

  async createReleasePipeline() {
    try{
      console.log(chalk.blueBright("Creating Release Pipeline"));
      let release = await this.connection.getReleaseApi();

      let tokenReplacedTemplate = JSON.stringify(createReleaseDefTemplate)
                                      .replaceAll("${imageName}", this.params.azResources.baseResourceGroupName)
                                      .replaceAll("${imageTag}", "unstable-latest")
                                      .replaceAll("${owner_id}", this.params.azDevOps.pipelineOwner)
                                      .replaceAll("${agentQueueId}", this.params.azDevOps.devAgenetQueueId.toString())
                                      .replaceAll("${serviceConnectionId}", this.params.azDevOps.serviceConnectionId)
                                      .replaceAll("${gitHubServiceConnectionId}", this.params.azDevOps.gitServiceConnectionId)
                                      .replaceAll("${resourceGroupName}", this.params.azResources.baseResourceGroupName)
                                      .replaceAll("${location}", this.params.azResources.location)
                                      .replaceAll("${appName}", `${this.params.azResources.getAppUrl('Dev')}`)
                                      .replaceAll("${appUrl}", `${this.params.azResources.getAppUrl('Dev')}`)
                                      .replaceAll("${registryName}", this.params.azResources.containerRegistryName)
                                      .replaceAll("${registryAddress}", this.params.azResources.containeRegistryAddress)
                                      .replaceAll("${projectId}", this.params.azDevOps.projectId)
                                      .replaceAll("${projectName}", this.params.azDevOps.projName)
                                      .replaceAll("${pipelineId}", this.params.azDevOps.devBuildPipelineId.toString())
                                      .replaceAll("${pipelineName}", `${this.params.azResources.baseResourceGroupName} Dev`)
                                      .replaceAll("${sourcePipelineName}", "${this.params.azResources.baseResourceGroupName} Dev")
                                      .replaceAll("${orgName}", this.params.azDevOps.orgName)
                                      .replaceAll("${storageAccountName}", this.params.azResources.storageAccountName)
                                      .replaceAll("${storageAccountUrl}", this.params.azResources.storageAccountBaseUrl + "dev-test-results")
                                      .replaceAll("${storageAccountKey}", this.params.azResources.storageAccountKey);
                                   

      await release.createReleaseDefinition(JSON.parse(tokenReplacedTemplate), this.params.azDevOps.projName);

      console.log(chalk.green("Created Release Pipeline"));
    }catch(err){
      console.log(chalk.red("Error Creating Release Pipeline"));
      console.log(err);
    }
  }

  async createInfrastructurePipeline(){
    try{
      console.log(chalk.blueBright("Creating infrastructure pipeline"));
      let release = await this.connection.getReleaseApi();

      var tokenReplacedTemplate = JSON.stringify(createInfrastructurePipeline)
          .replaceAll("${owner_id}", this.params.azDevOps.pipelineOwner)
          .replaceAll("${agentQueueId}", this.params.azDevOps.devAgenetQueueId.toString())
          .replaceAll("${serviceConnectionId}",  this.params.azDevOps.serviceConnectionId)
          .replaceAll("${gitServiceConnectionId}", this.params.azDevOps.gitServiceConnectionId)
          .replaceAll("${pipelineId}", this.params.azDevOps.devBuildPipelineId.toString())
          .replaceAll("${resourceGroupName}", this.params.azResources.baseResourceGroupName)
          .replaceAll("${stage}", "dev")
          .replaceAll("${location}", this.params.azResources.location)
          .replaceAll("${branch}", "master")
          .replaceAll("${projectId}", this.params.azDevOps.projectId)
          .replaceAll("${imageName}", this.params.azResources.baseResourceGroupName.toLocaleLowerCase())
          .replaceAll("${imageTag}", "unstable-latest")
          .replaceAll("${appName}", this.params.azResources.baseAppName)
          .replaceAll("${registryAddress}", this.params.azResources.containeRegistryAddress)
          .replaceAll("${sourcePipelineName}", "${this.params.azResources.baseResourceGroupName} Dev")
          .replaceAll("${pipelineName}", "Infrastructure Pipeline");

        await release.createReleaseDefinition(JSON.parse(tokenReplacedTemplate), this.params.azDevOps.projName);

        console.log(chalk.green("Created Release Pipeline"));
  
    }catch(err){
      console.log("Error while creating infrastructure pipeline");
      console.log(err);
    }
  }
}
