
// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');


// Define all the handlers
const sessionCreateHandlers = {};





// Create New Session
sessionCreateHandlers.sessionCreate = (data,callback) => {
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    const templateData = {
      'head.title' : 'Login to your account.',
      'head.description' : 'Please enter your email and password to access your account.',
      'body.class' : 'sessionCreate'
    };
    // Read in a template as a string
    helpers.getTemplate('sessionCreate',templateData,(err,str) => {
      if(!err && str){
        // Add the universal header and footer
        helpers.addUniversalTemplates(str,templateData,(err,str) => {
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


// Not-Found
sessionCreateHandlers.notFound = (data,callback) => {
  callback(404);
};



module.exports = sessionCreateHandlers;
