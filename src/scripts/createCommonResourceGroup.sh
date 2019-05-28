#! /bin/bash

#Create Resource Group
az group create --name $1 --location $2

#Create Container Registry
az acr create --resource-group $1 --name $3 --sku Basic

#Create Storage Account
az storage account create \
    --name $4 \
    --resource-group $1 \
    --location $2 \
    --sku "Standard_LRS"

#Create Slack Function App
az functionapp create \
     --name $5 \
     --resource-group $1 \
     --consumption-plan-location $2 \
     --storage-account $4 \
     --runtime node

#Create Alert
az monitor metrics alert create -n ErrorLogAlert \
    --resource-group $1 \
    --condition "count traces > 1 where SecurityLevel includes Error"
