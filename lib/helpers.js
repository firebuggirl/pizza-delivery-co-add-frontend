/*
 * Helpers for letious tasks
 *
 */

// Dependencies
let config = require('./config');
let crypto = require('crypto');//need this to hash passwords
let https = require('https');
let querystring = require('querystring');//need this to stringify urls

const path = require('path');
const fs = require('fs');
const util = require('util');
// Configure stripe debugger.
const debug = util.debuglog('stripe');
// Container for all the helpers
let helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
  try{
    let obj = JSON.parse(str);
    return obj;
  } catch(e){
    return {};
  }
};


// Create a SHA256 hash
helpers.hash = (str) => {
  if(typeof(str) == 'string' && str.length > 0){
    let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (strLength) => {
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = '';
    for(i = 1; i <= strLength; i++) {
        // Get a random charactert from the possibleCharacters string
        let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        // Append this character to the string
        str+=randomCharacter;
    }
    // Return the final string
    return str;


  } else {
    return false;
  }
};

const source = config.stripe.source;
const currency = config.stripe.currency;

helpers.sendStripeOrder = async ({amount, currency, source, description = ''}) => {
  // Promisify https.request() function.
  return new Promise((resolve, reject) => {
    // Check that all required fields are provided.
    if (!amount || !source || !currency) {
      reject(new Error('Missing required payment fields'));
    }

    // Configure the request payload.
    const payload = {
      amount,
      currency,
      source,
      description

    };

    // Stringify the payload.
    const stringPayload = querystring.stringify(payload);

    // Debug stripe payload.
    debug('\x1b[33m%s\x1b[0m', stringPayload);


    // Configure the request details
    const requestDetails = {
        'protocol' : 'https:',
        'hostname' : 'api.stripe.com',
        'method' : 'POST',
        'path' : '/v1/charges',
        'auth' : config.stripe.PIRPLE_STRIPE_TOKEN_SK+':'+config.stripe.PIRPLE_STRIPE_TOKEN_PK ,
        'headers' : {
          'Content-Type' : 'application/x-www-form-urlencoded',//not a JSON content-type API...
          'Content-Length': Buffer.byteLength(stringPayload)//Buffer is available globally....get byte length of stringified payload
        }
      };

    // Instantiate the request object.
    const request = https.request(requestDetails, (response) => {
      // Grab the status of the sent request.
      const status = response.statusCode;
      // Return successfully if the request went through.
      if (status === 200 || status === 201) {
        resolve();
      } else {
        reject(new Error(`Payment has failed with status ${status}`));
      }
    });

    // Bind to the error event so it doesn't get thrown.
    request.on('error', (error) => {
      reject(error);
    });

    // Add payload to the request.
    request.write(stringPayload);

    // End the request.
    request.end();
  });
};


helpers.sendMailGunEmail = (userEmail,msg,callback) => {
  // Validate parameters
  userEmail = typeof(userEmail) == 'string' && userEmail.trim().length > 0 ? userEmail.trim() : false;
  msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
  if(userEmail && msg){

    // Configure the request payload
    const payload = {
      'From' : config.PIRPLE_FAKE_TEST_EMAIL,
      'To' : userEmail,
      'Body' : msg
    };
    const stringPayload = querystring.stringify(payload);


    // Configure the request details
    const requestDetails = {
      'protocol' : 'https:',
      'hostname' : 'api.mailgun.net/v3',
      'method' : 'POST',
      'path' : config.PIRPLE_MAILGUN_SANDBOX_DOMAIN,
      'auth' : config.PIRPLE_MAILGUN_API_KEY,
      'headers' : {
        'Content-Type' : 'application/x-www-form-urlencoded',//not a JSON content-type API
        'Content-Length': Buffer.byteLength(stringPayload)//Buffer is available globally....get byte length of stringified payload
      }
    };

    // Instantiate the request object
    const req = https.request(requestDetails, (res) => {
        // Grab the status of the sent request
        let status =  res.statusCode;
        // Callback successfully if the request went through
        if(status == 200 || status == 201){
          //callback(false);//calling back false because we're using the error back pattern....there is no error
          const msg = "Your order has been placed."
          helpers.sendMailGunEmail(userEmail,msg,callback);
        } else {
          //callback('Status code returned was '+status);
          const msg = "Your order has not been placed usccessfully."
          helpers.sendMailGunEmail(userEmail,msg,callback);
        }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error', (e) => {
      callback(e);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();

  } else {
    callback('Given parameters were missing or invalid');
  }
};


// Get the string content of a template, and use provided data for string interpolation
helpers.getTemplate = (templateName,data,callback) => {
  templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
  data = typeof(data) == 'object' && data !== null ? data : {};
  if(templateName){
    const templatesDir = path.join(__dirname,'/../templates/');
    fs.readFile(templatesDir+templateName+'.html', 'utf8', (err,str) => {
      if(!err && str && str.length > 0){
        // Do interpolation on the string before returning it
        const finalString = helpers.interpolate(str,data);//take string of template pulled out and insert find/replace any data there
        callback(false,finalString);
      } else {
        callback('No template could be found');
      }
    });
  } else {
    callback('A valid template name was not specified');
  }
};


// Add the universal header and footer to a string, and pass provided data object to header and footer for interpolation
helpers.addUniversalTemplates = (str,data,callback) => {
  str = typeof(str) == 'string' && str.length > 0 ? str : '';//sanity check
  data = typeof(data) == 'object' && data !== null ? data : {};//sanity check
  // Get the header
  helpers.getTemplate('_header',data,(err,headerString) => {
    if(!err && headerString){
      // Get the footer
      helpers.getTemplate('_footer',data,(err,footerString) => {
        if(!err && headerString){
          // Add them all together
          const fullString = headerString+str+footerString;
          callback(false,fullString);
        } else {
          callback('Could not find the footer template');
        }
      });
    } else {
      callback('Could not find the header template');
    }
  });
};

// Take a given string and data object, and find/replace all the keys within it
helpers.interpolate = (str,data) => {
  str = typeof(str) == 'string' && str.length > 0 ? str : '';//sanity check
  data = typeof(data) == 'object' && data !== null ? data : {};//sanity check

  // Add the templateGlobals to the data object, prepending their key name with "global."
  for(let keyName in config.templateGlobals){
     if(config.templateGlobals.hasOwnProperty(keyName)){
       data['global.'+keyName] = config.templateGlobals[keyName]
     }
  }
  // For each key in the data object, insert its value into the string at the corresponding placeholder
  for(let key in data){//data holds all of the globals
     if(data.hasOwnProperty(key) && typeof(data[key] == 'string')){
        const replace = data[key];
        const find = '{'+key+'}';
        str = str.replace(find,replace);
     }
  }
  return str;
};


// Get the contents of a static (public) asset
helpers.getStaticAsset = (fileName,callback) => {
  fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;
  if(fileName){
    const publicDir = path.join(__dirname,'/../public/');
    fs.readFile(publicDir+fileName, (err,data) => {
      if(!err && data){
        callback(false,data);
      } else {
        callback('No file could be found');
      }
    });
  } else {
    callback('A valid file name was not specified');
  }
};
// Export the module
module.exports = helpers;
