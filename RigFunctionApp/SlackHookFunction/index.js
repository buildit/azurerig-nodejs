const request = require('request-promise');

module.exports = async function(context, req){
    context.log('JavaScript HTTP trigger function processed a request.');

    await request.post({
        url: 'https://hooks.slack.com/services/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',
        method: 'POST',
        json: {text: 'Hello World'}
    });


   // let response = await https.request(opts);
    console.log(`statusCode: ${res.statusCode}`);
    context.res = {
        //status: 200, /* Defaults to 200 */
        body: "Hello " + (req.query.name || req.body.name)
    }

    context.done();
};

