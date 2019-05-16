#! /bin/bash

#Create Resource Group
az group create --name $1 --location $2

#Create Container Registry
az acr create --resource-group $1 --name $3 --sku Basic

#Create Storage Account
az storage account create \
    --name $4
    --resource-group $1 \
    --location $2

#Create Slack Function App
az functionapp create \
     --name $5 \
     --resource-group $1 \
     --consumption-plan-location $2 \
     --storage-account $4 \
     --runtime node

#Create Alert
az monitor alert create \
    --name ErrorLogAlert \ 
    --description "Errors in AppInsights Trace Log" \
    --condition "Whenever the traces is greater than 1 count where SecurityLevel includes Error"
