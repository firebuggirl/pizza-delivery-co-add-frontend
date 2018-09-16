/*
 * Request Handlers
 *
 */

// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');
const config = require('../lib/config');

// Define all the handlers
const handlers = {};

/*
 * HTML Handlers
 *
 */

 // Index
 handlers.index = (data,callback) => {
   // Reject any request that isn't a GET
   if(data.method == 'get'){
     // Prepare data for interpolation
     const templateData = {//title and meta description, etc...
       'head.title' : 'SoCal Pizaa',
       'head.description' : 'We have the best pizza in the world!!',
       'body.class' : 'index'
     };
     // Read in a template as a string
     helpers.getTemplate('index',templateData,(err,str) => {
       if(!err && str){
         // Add the universal header and footer
         helpers.addUniversalTemplates(str,templateData,(err,str) => {//interpolation function will auto add in globals ??
           if(!err && str){
             // Return that page as HTML
             callback(200,str,'html');
           } else {
             callback(500,undefined,'html');
           }
         });
       } else {
         callback(500,undefined,'html');
       }
     });
   } else {
     callback(405,undefined,'html');
   }
 };


/*
 * JSON API Handlers
 *
 */

// Ping
handlers.ping = (data,callback) => {
    callback(200);
};

// Not-Found
handlers.notFound = (data,callback) => {
  callback(404);
};



// Export the handlers
module.exports = handlers;
