import chalk from "chalk";
import figlet from "figlet";
import path from "path";
import program from "commander";
import askQuestions from "./questions";
import DevOpsService from "./DevOpsService";
import AzureService from "./AzureService";
const clear = require("clear");

const run = async () => {
  try {
    //Show introduction
    init();

    //ask questions;
    const params = await askQuestions();

    const azureService: AzureService = new AzureService(
      "",
      "",
      ""
    );


    var devOps = new DevOpsService(params.azDevOps);


    //Create DevOps Project
   // await createProj.createProject(params.azDevOps.projName);

    //Create Common ResourceGroup
    //await azureService.azureLogin();
    //await azureService.createCommonResourceGroup();


    devOps.createBuildPipeline();

  } catch (e) {
    console.log(e);
  }
};

const init = () => {
  clear();
  console.log(
    chalk.blueBright(
      figlet.textSync("AzureRig-Cli", { horizontalLayout: "full" })
    )
  );
};

run();

/*
import * as azdev from "azure-devops-node-api";
import * as coreInterfaces from "azure-devops-node-api/interfaces/CoreInterfaces";
import UserInputs from './UserInputs;
import CreateProject from './CreateProject';

let userInputs = new UserInputs();

var params = await userInputs.getRigParameters();


//let createProject = new CreateProject(params.azDevOps);

//createProject.createProject("TestProject");
*/
