
// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');
const config = require('../lib/config');

// Define all the handlers
const faviconHandlers = {};




// Favicon
faviconHandlers.favicon = (data,callback) => {
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Read in the favicon's data
    helpers.getStaticAsset('favicon.ico',(err,data) => {
      if(!err && data){
        // Callback the data
        callback(200,data,'favicon');
      } else {
        callback(500);
      }
    });
  } else {
    callback(405);
  }
};

// Not-Found
faviconHandlers.notFound = (data,callback) => {
  callback(404);
};


module.exports = faviconHandlers;
