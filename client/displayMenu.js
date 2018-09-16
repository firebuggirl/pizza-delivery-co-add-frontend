
/*
 * Request orderHandlers
 *
 */

// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');


// Define all the orderHandlers
const displayMenuHandlers = {};




// Create a new order
displayMenuHandlers.displayMenu = (data,callback) => {
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    const templateData = {
      'head.title' : 'This is Our Menu',
      'body.class' : 'displayMenu'
    };
    // Read in a template as a string
    helpers.getTemplate('displayMenu',templateData,(err,str) => {
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
displayMenuHandlers.notFound = (data,callback) => {
  callback(404);
};


// Export the orderHandlers
module.exports = displayMenuHandlers;
