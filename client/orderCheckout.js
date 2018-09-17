// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');



const orderCheckoutHandlers = {};


// Edit Your Account
orderCheckoutHandlers.orderCheckout = (data,callback) => {
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    var templateData = {
      'head.title' : 'Checkout',
      'head.description': 'Thank you for doing business with SoCal Pizza!',
      'body.class' : 'checkout'
    };
    // Read in a template as a string
    helpers.getTemplate('orderCheckout',templateData,(err,str) => {
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
orderCheckoutHandlers.notFound = (data,callback) => {
  callback(404);
};


module.exports = orderCheckoutHandlers;
