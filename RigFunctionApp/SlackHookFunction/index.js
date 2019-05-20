const https = require('request');

module.exports = async function(context, req){
<<<<<<< HEAD
    context.log('JavaScript HTTP trigger function processed a request.');
=======
    console.log('JavaScript HTTP trigger function processed a request.');
>>>>>>> 5cd6ad9bf6f50cc26e9ee0840dca8f88a0805084

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

<<<<<<< HEAD
    let post_req = https.request(opts);
   
 //   context.response = {
        //status: 200, /* Defaults to 200 */
//        body: "Hello " + (req.query.name || req.body.name)
  //  }

  post_req.write(post_data);
  post_req.end();
       
  context.done();
};
=======
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
>>>>>>> 5cd6ad9bf6f50cc26e9ee0840dca8f88a0805084
