
// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');


// Define all the handlers
const deleteSessionHandlers = {};

// Session has been deleted
deleteSessionHandlers.sessionDeleted = (data,callback) => {
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    const templateData = {
      'head.title' : 'Logged Out',
      'head.description' : 'You have been logged out of your account.',
      'body.class' : 'sessionDeleted'
    };
    // Read in a template as a string
    helpers.getTemplate('sessionDeleted',templateData,(err,str) => {
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
deleteSessionHandlers.notFound = (data,callback) => {
  callback(404);
};


module.exports = deleteSessionHandlers;
