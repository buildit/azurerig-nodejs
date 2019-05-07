import inquirer, { Questions } from "inquirer";
import {RigParameters, AzResources, AzDevOps, GitParams} from "./types/parameters";

const askQuestions = async () => {
  const questions = [
    {
      name: "TENANT_ID",
      type: "input",
      message: "Azure AD TenantID"
    },
    {
      name: "SUBSCRIPTION_ID",
      type: "input",
      message: "Subscription to create resource group"
    },
    {
      name: "RESOURCE_GROUP_NAME",
      type: "input",
      message: "Base Resource Name must be less than 18 characters "
    },
    {
      name: "LOCATION",
      type: "input",
      message: "Location"
    },
    {
      name: "DEVOPS_USERNAME",
      type: "input",
      message: "Devops Username (normally email with Azure subscription):"
    },
    {
      name: "DEVOPS_PAT",
      type: "input",
      message:
        "Devops Personal Access Token (check readme for instructions to get):"
    },
    {
        name: "DEVOPS_PROJ",
        type: "input",
        message: "DevOps Project Name:"
    },
    {
      name: "GITHUB_PAT",
      type: "input",
      message:
        "Github Personal Access Token (check readme for instructions to get):"
    }
  ];

  var answers : any = await inquirer.prompt(questions);
  const { TENANT_ID, RESOURCE_GROUP_NAME, LOCATION, DEVOPS_USERNAME, DEVOPS_PAT, DEVOPS_PROJ, GITHUB_PAT, SUBSCRIPTION_ID } = answers;

  let appServiceName = `${RESOURCE_GROUP_NAME}AppService`;


  return new RigParameters(
    new AzResources(TENANT_ID, SUBSCRIPTION_ID, RESOURCE_GROUP_NAME, appServiceName, LOCATION),
    new AzDevOps(DEVOPS_USERNAME, DEVOPS_PAT, "https://dev.azure.com/BuilditAzureSandbox", DEVOPS_PROJ),
    new GitParams(GITHUB_PAT, "org", "repo"));
};

export default askQuestions;
