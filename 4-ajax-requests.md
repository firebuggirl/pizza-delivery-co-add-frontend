# Making AJAX Requests

https://pirple.thinkific.com/courses/take/the-nodejs-master-class/lessons/3820308-making-ajax-requests


- in `public/app.js`:


   - craft raw `XMLHttpRequest`



   - `persist` session token for client side to `local storage`

   - create `app.client = {}` -> `app.client.request`



- run `node index.js`


      - `localhost:7777`


          - inspect -> go to `console`:


          - Run:

          ` app.client.request(undefined, '/ping', 'GET',  undefined, undefined,  function(statusCode, payload){
             console.log(statusCode, payload);
            }); `     //queryStringObject, payload = undefined


              - returns `200
                        Object {  }`


          - Run:


            ` app.client.request(undefined, 'api//users', 'GET',  undefined, undefined, function(statusCode, payload){
              console.log(statusCode, payload);
            }); `
