#! /bin/bash

#Create Resource Group
az group create --name $1 --location $5

#Create App Service Plan
az appservice plan create --resource-group $1 \
    --name $2-plan \
    --is-linux \
    --sku B1

#Create Webapp
az webapp create --resource-group $1 \
    --plan $2-plan \
    --name $2 \
    --runtime "python|2.7"

#Create App Insights
az resource create \
    --resource-group $1 \
    --resource-type "Microsoft.Insights/components" \
    --name $2-appinsights \
    --location eastus\
    --properties '{"Application_Type":"web"}'

#Set Container Image on App Service
az webapp config container set --resource-group $1 \
    --name $2 \
    --docker-custom-image-name $3/$4 \
    --docker-registry-server-url https://$3

#Get App Insights Instrumentation Key
INSTRUMENTATION_KEY=$(az resource show -g $1 -n $2-appinsights --resource-type "Microsoft.Insights/components" --query properties.InstrumentationKey | tr -d '"') 

#Add Instrumentation key to 
az webapp config appsettings set \
    --resource-group $1 \
    --name $2 \
    --settings APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY 