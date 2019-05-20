const https = require('request');

module.exports = async function(context, req){
    context.log('JavaScript HTTP trigger function processed a request.');

    request.post({
        url: 'https://hooks.slack.com/services/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',
        method: 'POST',
        json: {text: 'Hello World'}
    });

    const post_data =  {
                "text": "Hello, world."
            };

    const opts = {
            hostname: "hooks.slack.com",
            post: 443,
            path: "/services/T03ALPC1R/BGDLRTZNH/YGgnmqUs7cyCXMKcwueIlBBJ",
            method: "POST",
            Headers: {
                'Content-Type': 'application/json',
                'Content-Length': post_data.length
            }
        };

    let post_req = https.request(opts);
   
 //   context.response = {
        //status: 200, /* Defaults to 200 */
//        body: "Hello " + (req.query.name || req.body.name)
  //  }

  post_req.write(post_data);
  post_req.end();
       
  context.done();
};