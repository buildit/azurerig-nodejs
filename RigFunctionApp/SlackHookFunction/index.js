const https = require('http');

module.exports = function(context, req){
    context.log('JavaScript HTTP trigger function processed a request.');

    if(req.query.name || (req.body && req.body.name)){
        
        const opts = {
            hostname: "hooks.slack.com",
            post: 443,
            path: "/services/T03ALPC1R/BGDLRTZNH/YGgnmqUs7cyCXMKcwueIlBBJ",
            method: "POST",
            body: {
                "text": "Hello, world."
            },
            Headers: {
                'Content-Type': 'application/json'
            }
        };

        let response = await https.request(opts);
        console.log(`statusCode: ${res.statusCode}`);
        context.res = {
                //status: 200, /* Defaults to 200 */
                body: "Hello " + (req.query.name || req.body.name)
        }
    } else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
    context.done();
};
