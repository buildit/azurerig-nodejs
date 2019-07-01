# Azure Rig

This repository contains a series of bash scripts and JSON templates used to create and maintain a simple Rig implementation on Azure. The technologies used for this Rig implementation consist primarily of PaaS offerings in Azure as well managed Azure DevOps pipelines.

* Backlog: <https://digitalrig.atlassian.net/jira/software/projects/ARI/boards/437/backlog>
* Live DevOps project: <https://dev.azure.com/BuilditAzureSandbox/BuilditAzureRig>
* Integration: <https://azurerigappservicedev.azurewebsites.net/>
* Staging: <https://azurerigappservicestage.azurewebsites.net/>
* Production: <https://azurerigappserviceprod.azurewebsites.net/>

## Prerequisites

### Authorize requests for Azure

A Personal Access Token (PAT) is required to authorize API requests. To grant a PAT follow these steps:

1. Go to <https://dev.azure.com/{organization}> to get to the DevOps organization homepage.
1. Click on your user icon in the top right corner and click the security tab from the dropdown menu.
1. Click new token and provide a unique name and access scope.
1. Copy and store the token in a secure location.

sample command (username is normally the email address of the user)
{personalaccesstoken} is the PAT obtained from the steps above.
{organization} is the name of the organization implementing the rig.

```curl -u username:{personalaccesstoken} "https://dev.azure.com/{organization}/_apis/projects?api-version=5.0"```

### Authorize requests for Github

A PAT for the Azure pipeline to access github must be created and added to the project:

1. Sign into <https://github.com/settings/tokens> .
1. Click generate new token with the scopes -- repo, read:user, user:email, admin:repo_hook .
1. Copy and store the token in a secure location.

## Running the Rig

1. Clone this repository
1. run the command: `make create-populateProject`
1. Respond to the step by step prompts for parameter values
1. Resource Group and Pipelines will be created and a build will be kicked off (may take a few minutes)

## Assumptions

1. The hosted application is containerized
1. The Dockerfile runs any unit tests and exports the results in JUnit format
1. The Dockerfile contains an intermediate container step that AZCopies the test results to blob storage. (see example)
1. The application to deploy exists in a GitHub repository

## Features

The Azure Rig makes use of a number of different Azure features including:

1. Azure Resource Groups
1. Azure Web App for containers
1. Azure Container Registries
1. Azure DevOps Pipelines

## Components

The major components of this Rig are:

1. A common resource group shared by all enviornments consiting of the ACR and storage account.
1. A DevOps build pipeline
1. A DevOpt release pipeline
1. Three resource groups (one per enviornment) for releasing the application

## Azure DevOps Build Pipeline

The high level steps for these pipelines:

1. Build and containerize the application from a Dockerfile, this includes running unit tests and exporting the results to blob storage.
1. Tag the image according to the current branch being built (dev, feature, master, etc.)
1. Download the test results from blob storage
1. Publish the test results so they become associated with the build
1. Push the container image to Azure Container Registry.

## Azure DevOps Release Pipeline

Each environment

1. Creates the deployment environment resource group (if not exists)
1. Creates or Updates the WepApp service container

An integration environment is triggered to be created after a successful build from a development branch

A change to the master branch triggers the creation of a staging environment and upon passing an approval gate a production environment is created with the image that passed staging

## Connect to Azure Devops Services API

In order to create build and release pipelines, the Azure DevOps Services REST API must be used [API Documentation](https://docs.microsoft.com/en-us/rest/api/azure/devops/?view=azure-devops-rest-5.0)

## Required Parameters

The goal of the Azure Rig is not to overwhelm the user with an endless array of parameters and options required in order to get started. That being said there are still some inputs that are required from the user.

1. Location (ex. Central US, East US, etc)
1. DevOps Username
1. DevOps PAT (see above)
1. GitHub PAT (see above)
1. Base name for the resource groups that get generated

## TODOs

* Need to extract more parameters out of our templates
* Likely need to move to REST API or ARM templates for creating Azure resources
  * Application Insights alerts can't be created via the `az` CLI
* Move away from BASH scripts and write utilities in code.  `curl` & `jq` just aren't sufficient to deal w/ the chattiness of the Azure & Azure DevOps services.

### Database (TODO)

The Azure Rig supports two database options at present:

1. An Azure SQL Database can be provisioned in the resource group.
1. Deploy SQL Server Container to AKS cluster with persisted volume.
