var request = require("request-promise");

module.exports = asunc function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    context.log(process.env["SLACK_HOOK_URL"]);

    let opts = {
            method: 'POST', 
            uri: 'https://hooks.slack.com/services/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',
            body: {
                text: "Hello World!"
            },
            json: true
        };

     await request(opts);
     
    return {
        status: 200, 
        body: "Posted to Slack"
    };
};