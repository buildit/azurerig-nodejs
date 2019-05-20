var request = require("request-promise");

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
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
            // status: 200, /* Defaults to 200 */
            body: "Hello " + (req.query.name || req.body.name)
        };

        context.done();
    });
};