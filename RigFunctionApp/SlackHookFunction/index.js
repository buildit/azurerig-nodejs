var request = require("request-promise");

module.exports = async function (context, req) {
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

     request(opts).then(function(body){
        context.res = {
            status: 200, 
            body: "Posted to Slack"
        };

        context.done(null, res);
    }).catch(function(err){
        context.res = {
            status:500,
            body: `Error Posting to Slack, ${err}`
        }
    });
    ;
};