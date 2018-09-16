/*
 * Request editCartHandlers
 *
 */

// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');
const config = require('../lib/config');
const tokenHandlers = require('./tokens');
const path = require("path");
const fs = require("fs");
const menuObject = require('../model/menu-items');

//editCartHandlers.cartEdit
// Define all the editCartHandlers
const editCartHandlers = {};

// Not-Found
editCartHandlers.notFound = (data,callback) => {
  callback(404);
};

// cart
editCartHandlers.cart = (data,callback) => {
  const acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    editCartHandlers._cart[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the cart methods
editCartHandlers._cart  = {};


// Edit the Cart/order
editCartHandlers.cartEdit = (data,callback) => {
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Prepare data for interpolation
    let templateData = {
      'head.title' : 'Cart Details',
      'body.class' : 'cartEdit'
    };
    // Read in a template as a string
    helpers.getTemplate('orderTotalEdit',templateData,(err,str) => {
      if(!err && str){
        // Add the universal header and footer
        helpers.addUniversalTemplates(str,templateData, (err,str) => {
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



// Export the editCartHandlers
module.exports = editCartHandlers;
