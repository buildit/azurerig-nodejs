import * as azdev from "azure-devops-node-api";
import * as coreInterfaces from "azure-devops-node-api/interfaces/CoreInterfaces";
import {AzDevOps} from "./types/parameters";
import { DesignerProcess ,YamlProcess, BuildDefinition } from "azure-devops-node-api/interfaces/BuildInterfaces";

export default class {
  private connection: azdev.WebApi;

  constructor(params:AzDevOps) {
    let authHandler = azdev.getPersonalAccessTokenHandler(params.pat);
    this.connection = new azdev.WebApi(params.orgName, authHandler);


    console.log("made it here 1");
  }

  async createProject(projectId: string): Promise<boolean> {
    console.log("made it here 2");
    
    let core = await this.connection.getCoreApi();

    console.log("made it here 3");

    const projectToCreate: coreInterfaces.TeamProject = {
      name: projectId,
      description:
        "sample project created automatically by azure-devops-node-api.",
      visibility: coreInterfaces.ProjectVisibility.Private,
      capabilities: {
        versioncontrol: { sourceControlType: "Git" },
        processTemplate: {
          templateTypeId: "6b724908-ef14-45cf-84f8-768b5384da45"
        }
      }
      // _links: null,
      // defaultTeam: null,
      //abbreviation: null,
      //id: null,
      // revision: null,
      //state: null,
      //url: null
    };

    
      var x = await core.queueCreateProject(projectToCreate);
    return true;
  }

  async createBuildPipeline(){
    try{
    let build = await this.connection.getBuildApi();
    let x : YamlProcess = {
      yamlFilename: "./yaml/buildDefenition.yaml"
    };

    let process : DesignerProcess = {
      phases: []
    };


    var repository = {
      id: "buildit/slackbot",
      type: "GitHub",
      url: "https://api.githube.com/repos/buildit/slackbot",
      defaultBranch: "master",
      name: "buildit/slackbot",
      
    };
    const buildDef : BuildDefinition = {
      name: "DevBuild",
      process: x,
      repository: repository
    };

    console.log("Creating build definition");

    build.createDefinition(buildDef, "AndyTestIt"); 
  }
  catch(err){
    console.log(err);
  }
  }
}