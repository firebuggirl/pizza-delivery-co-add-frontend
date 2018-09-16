/*
 * Server-related tasks
 *
 */

 // Dependencies
 const http = require('http');
 const https = require('https');
 const url = require('url');
 const StringDecoder = require('string_decoder').StringDecoder;
 const config = require('./config');
 const fs = require('fs');
 const helpers = require('./helpers');
 const path = require('path');


 /*
  * Client Side Routes/templates
  */
 const handlers = require('../client/handlers');
 const createAccountHandlers = require('../client/accountCreate');
 const sessionCreateHandlers = require('../client/sessionCreate');
 const deleteSessionHandlers = require('../client/sessionDelete');
 const editAccountHandlers = require('../client/accountEdit');
 const deleteAccountHandlers = require( '../client/accountDeleted');
 const orderCreateHandlers = require('../client/orderCreate');
 const displayMenuHandlers = require('../client/displayMenu');
 const displayOrderHandlers = require('../client/displayTotal');
 const thankYouHandlers = require('../client/thankYou');

 /*
  * Server Side Routes/Handlers
  */
 const publicHandlers = require('../routes/public');
 const faviconHandlers = require('../routes/favicon');
 const editCartHandlers = require('../routes/cartEdit');
 const checkoutHandlers = require('../routes/checkout');
 //const orderCheckoutHandlers = require('../client/orderCheckout');
 const userHandlers = require('../routes/users');
 const tokenHandlers = require('../routes/tokens');
 const menuHandlers = require('../routes/menu');
 const cartHandlers = require('../routes/cart');
 const orderConfirmHandlers = require('../routes/confirm');

 const util = require('util');
 const debug = util.debuglog('server');

// Instantiate the server module object
 const server = {};


//
// helpers.sendStripeOrder('test2@test2.com', '', (err) => {
//   console.log('This was the error', err);
// });

 // Instantiate the HTTP server
server.httpServer = http.createServer((req,res) => {
   server.unifiedServer(req,res);
 });

 // Instantiate the HTTPS server
server.httpsServerOptions = {
   'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
   'cert': fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
 };
 server.httpsServer = https.createServer(server.httpsServerOptions,(req,res) => {
   server.unifiedServer(req,res);
 });



// All the server logic for both the http and https server
server.unifiedServer = (req,res) => {

  // Parse the url
  const parsedUrl = url.parse(req.url, true);

  // Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  const queryStringObject = parsedUrl.query;

  // Get the HTTP method
  const method = req.method.toLowerCase();

  //Get the headers as an object
  const headers = req.headers;

  // Get the payload,if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
      buffer += decoder.write(data);
  });
  req.on('end', () => {
      buffer += decoder.end();

      // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
      let chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

      // If the request is within the public directory use to the public handler instead
      chosenHandler = trimmedPath.indexOf('public/') > -1 ? publicHandlers.public : chosenHandler;

      // Construct the data object to send to the handler
      const data = {
        'trimmedPath' : trimmedPath,
        'queryStringObject' : queryStringObject,
        'method' : method,
        'headers' : headers,
        'payload' : helpers.parseJsonToObject(buffer)
      };

      // Route the request to the handler specified in the router
      chosenHandler(data,(statusCode,payload,contentType) => {

        // Determine the type of response (fallback to JSON)
        contentType = typeof(contentType) == 'string' ? contentType : 'json';

        // Use the status code returned from the handler, or set the default status code to 200
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

        // Return the response parts that are content-type specific
        let payloadString = '';
        if(contentType == 'json'){
          res.setHeader('Content-Type', 'application/json');
          payload = typeof(payload) == 'object'? payload : {};
          payloadString = JSON.stringify(payload);
        }

        if(contentType == 'html'){
          res.setHeader('Content-Type', 'text/html');
          payloadString = typeof(payload) == 'string'? payload : '';
        }

        if(contentType == 'favicon'){
          res.setHeader('Content-Type', 'image/x-icon');
          payloadString = typeof(payload) !== 'undefined' ? payload : '';
        }

        if(contentType == 'plain'){
          res.setHeader('Content-Type', 'text/plain');
          payloadString = typeof(payload) !== 'undefined' ? payload : '';
        }

        if(contentType == 'css'){
          res.setHeader('Content-Type', 'text/css');
          payloadString = typeof(payload) !== 'undefined' ? payload : '';
        }

        if(contentType == 'png'){
          res.setHeader('Content-Type', 'image/png');
          payloadString = typeof(payload) !== 'undefined' ? payload : '';
        }

        if(contentType == 'jpg'){
          res.setHeader('Content-Type', 'image/jpeg');
          payloadString = typeof(payload) !== 'undefined' ? payload : '';
        }


        // Return the response-parts common to all content-types
        res.writeHead(statusCode);
        res.end(payloadString);

        // If the response is 200, print green, otherwise print red
        if(statusCode == 200){
          debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
        } else {
          debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
        }
      });

  });
};

 // Define routers
 server.router = {
     '' : handlers.index,
     'account/create' : createAccountHandlers.accountCreate,
     'account/edit' : editAccountHandlers.accountEdit,
     'account/deleted' : deleteAccountHandlers.accountDeleted,
     'session/create' : sessionCreateHandlers.sessionCreate,
     'session/deleted' : deleteSessionHandlers.sessionDeleted,
     'menu': displayMenuHandlers.displayMenu,
     'order/create': orderCreateHandlers.orderCreate,
     'order/total': displayOrderHandlers.displayTotal,
     'cart/edit': editCartHandlers.cartEdit,
     'order/thankyou': thankYouHandlers.thankYou,
     //'order/checkout': orderCheckoutHandlers.orderCheckout,
     'ping' : handlers.ping,
     'api/users' : userHandlers.users,
     'api/tokens': tokenHandlers.tokens,
     'api/menu'  : menuHandlers.menu,
     'api/cart' : cartHandlers.cart,
     //'api/checkout': checkoutHandlers.checkout,
     'api/confirm': orderConfirmHandlers.confirm,
     'public' : publicHandlers.public,
     'favicon.ico': faviconHandlers.favicon
//};
};
 // Init script
server.init = () => {
  // Start the HTTP server
  server.httpServer.listen(config.httpPort,() => {
    console.log('The HTTP server is running on port '+config.httpPort);
  });

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, () => {
   console.log('The HTTPS server is running on port '+config.httpsPort);
  });
};





 // Export the module
 module.exports = server;
