#! /bin/bash

#Create Resource Group
az group create --name $1 --location $5

#Create Container Registry
az acr create --resource-group $1 --name $2 --sku Basic

#Create Storage Account
az storage account create \
    --name $3
    --resource-group $2 \
    --location $5

#Create Slack Function App
az functionapp create \
     --name $4 \
     --resource-group $1 \
     --consumption-plan-location $5 \
     --storage-account $6 \
     --runtime node