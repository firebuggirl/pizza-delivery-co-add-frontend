// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');



const deleteAccountHandlers = {};

// Account has been deleted
deleteAccountHandlers.accountDeleted = (data,callback) => {
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    const templateData = {
      'head.title' : 'Account Deleted',
      'head.description' : 'Your account has been deleted.',
      'body.class' : 'accountDeleted'
    };
    // Read in a template as a string
    helpers.getTemplate('accountDeleted',templateData,(err,str) => {
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
deleteAccountHandlers.notFound = (data,callback) => {
  callback(404);
};


module.exports = deleteAccountHandlers;
