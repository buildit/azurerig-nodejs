export AZURE_STORAGE_ACCOUNT=$1
export AZURE_STORAGE_KEY=$2
export CONTAINER_NAME=$3
export BUILD_NUMBER=$4
export WORKING_DIRECTORY=$5

export container_name=${CONTAINER_NAME}
export blob_name="E2E_TestReport_${BUILD_NUMBER}.xml"
export destination_file=${WORKING_DIRECTORY}/TestReport.xml

echo \"Downloading the file...\"
az storage blob download --container-name $container_name --name $blob_name --file $destination_file --output table