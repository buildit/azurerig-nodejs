var request = require("request-promise");

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    let opts = {
            method: 'POST', 
            uri: process.env["SLACK_HOOK_URL"],
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