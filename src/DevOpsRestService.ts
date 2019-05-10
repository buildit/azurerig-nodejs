import * as request from "request-promise";
import sleep from "./extensions/sleep";
import { AzDevOps, AzResources, RigParameters } from "./types/parameters";
import serviceConnectionTemplate from "./templates/createServiceConnectionSubscriptionTemplate.json";
import createGitServiceConnectionTemplate from "./templates/createGitServiceConnectionDataTemplate.json";
import slackReleaseNotificationsTemplate from "./templates/slackReleaseNotification.json";
import slackReleaseNotificationsPreRequestTemplate from "./templates/slackReleaseNotificationPreRequest.json";
import slackBuildNotificationTemplate from "./templates/slackBuildNotification.json";
import chalk from "chalk";

export default class {
  constructor(private params: RigParameters) {}

  async createServiceConnection(serviceConnectionName: string) {
    try {
      console.log(chalk.blueBright("Creating Service Connection"));
      let replacedTemplate = JSON.stringify(serviceConnectionTemplate)
        .replaceAll("${serviceConnectionId}", "$(uuidgen)")
        .replaceAll("${tennantId}", `${this.params.azResources.tenantId}`)
        .replaceAll(
          "${subscriptionId}",
          `${this.params.azResources.subscription}`
        )
        .replaceAll(
          "${resourceGroupId}",
          this.params.azResources.baseResourceGroupName
        )
        .replaceAll("${subscriptionName}", "RigSubscription")
        .replaceAll("${connectionName}", serviceConnectionName);

      let results: any = await request.post(
        `${this.params.azDevOps.orgUrl}/${
          this.params.azDevOps.projName
        }/_apis/serviceendpoint/endpoints?api-version=5.0-preview.1`,
        {
          json: JSON.parse(replacedTemplate),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(
              this.params.azDevOps.username + ":" + this.params.azDevOps.pat
            ).toString("base64")}`
          }
        }
      );

      this.params.azDevOps.serviceConnectionId = results.id;
      console.log(chalk.green("Created Service Connection"));
    } catch (e) {
      console.log(chalk.red("Error Creating Service Connection"));
      console.log(e);
    }
  }

  async createGitServiceConnection(serviceConnectionName: string) {
    try {
      console.log(chalk.blueBright("Creating Slack Build Service Connection"));
      let replacedTemplate = JSON.stringify(createGitServiceConnectionTemplate)
        .replaceAll("${gitServiceConnectionId}", "$(uuidgen)")
        .replaceAll("${gitPAT}", this.params.gitParams.pat)
        .replaceAll("${gitServiceConnectionName}", serviceConnectionName);

      let results: any = await request.post(
        `${this.params.azDevOps.orgUrl}/${
          this.params.azDevOps.projName
        }/_apis/serviceendpoint/endpoints?api-version=5.1-preview.1`,
        {
          json: JSON.parse(replacedTemplate),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(
              this.params.azDevOps.username + ":" + this.params.azDevOps.pat
            ).toString("base64")}`
          }
        }
      );

      this.params.azDevOps.gitServiceConnectionId = results.id;
      console.log(chalk.green("Created Slack Build Service Connection"));
    } catch (err) {
      console.log(chalk.red("Error Creating Slack Build Service Connection"));
    }
  }

  async createSlackBuildNotifications() {
    try {
      console.log(
        chalk.blueBright("Creating Slack Build Notification Service Connection")
      );

      let replacedTemplate = JSON.stringify(slackBuildNotificationTemplate)
        .replaceAll("${projectId}", this.params.azDevOps.projectId)
        .replaceAll("${slackHookUrl}", this.params.azDevOps.slackHookUrl);

      let results: any = await request.post(
        `${this.params.azDevOps.orgUrl}_apis/hooks/subscriptions?api-version=5.1-preview.1`,
        {
          json: JSON.parse(replacedTemplate),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(
              this.params.azDevOps.username + ":" + this.params.azDevOps.pat
            ).toString("base64")}`
          }
        });

        console.log(
          chalk.green("Created Slack Build Notification Service Connection")
        );
    } catch (err) {
      console.log(chalk.red("Error Creating Slack Build Notification Service Connection"));
      console.log(err);
    }
  }

  async createSlackReleaseNotifications() {
    try {
      console.log(
        chalk.blueBright("Creating Slack Release Notification Service Connection")
      );

      let replacedPreRequestTemplate = JSON.stringify(slackReleaseNotificationsPreRequestTemplate)
        .replaceAll("${projectId}", this.params.azDevOps.projectId);

      await request.post(
        `https://vsrm.dev.azure.com/${this.params.azDevOps.orgName}/_apis/hooks/inputValuesQuery?api-version=5.1-preview.1`,
        {
          json: JSON.parse(replacedPreRequestTemplate),
          headers: {
            Accept: "application/json;excludeUrls=true",
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(
              this.params.azDevOps.username + ":" + this.params.azDevOps.pat
            ).toString("base64")}`
          }
        }
      )

      let replacedTemplate = JSON.stringify(slackReleaseNotificationsTemplate)
        .replaceAll("${projectId}", this.params.azDevOps.projectId)
        .replaceAll("${slackHookUrl}", this.params.azDevOps.slackHookUrl);

      let results: any = await request.post(
        `https://vsrm.dev.azure.com/${this.params.azDevOps.orgName}/_apis/hooks/subscriptions?api-version=5.1-preview.1`,
        {
          json: JSON.parse(replacedTemplate),
          headers: {
            Accept: "application/json;excludeUrls=true",
            Origin: "https://dev.azure.com",
            Referer: `https://dev.azure.com/${this.params.azDevOps.orgName}/${this.params.azDevOps.projName}/_settings/serviceHooks`,
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(
              this.params.azDevOps.username + ":" + this.params.azDevOps.pat
            ).toString("base64")}`
          }
        }
      );

      console.log(
        chalk.green("Created Slack Release Notification Service Connection")
      );
    } catch (err) {
      console.log(JSON.stringify(err));
      if(err.error && err.error.typeName.includes("Microsoft.TeamFoundation.Framework.Server.DataspaceNotFoundException")){
        console.log(chalk.yellow("Retrying Creation of Slack Release Notifications"));
        await sleep(5000);
        await this.createSlackReleaseNotifications();
      }else {
        console.log(chalk.red("Error Creating Slack Release Service Connection"));
        console.log(err);
      }
    }
  }
}
