/*
 * Request orderConfirmHandlers
 *
 */

// Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');
const config = require('../lib/config');
const tokenHandlers = require('./tokens');
const path = require("path");
const fs = require("fs");
const cartHandlers = require('../routes/cart');
const menuObject = require('../model/menu-items');



//const stripe = require('stripe')(config.stripeKey);//how to add this w/out module installed?????
//const stripe = "https://api.stripe.com";
const stripe = helpers.sendStripeOrder;
const keySecret = config.hashingSecret;
const source = config.stripe.source;
// Define all the orderConfirmHandlers
const orderConfirmHandlers = {};

// Not-Found
orderConfirmHandlers.notFound = (data,callback) => {
  callback(404);
};

// order
orderConfirmHandlers.confirm = (data,callback) => {
  const acceptableMethods = ['post'];
  if(acceptableMethods.indexOf(data.method) > -1){
    orderConfirmHandlers._confirm[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the order methods
orderConfirmHandlers._confirm  = {};

//const getCartContents = cartHandlers._cart.get;

//POST localhost:7777/api/order?email=woof@woof.com
// SET Headers token = LOGGED_IN_USER_TOKEN application/json
// {
// 	"userEmail": "ms@stars.com",
// 	"amount": "$29",
// 	"currency": "usd",
// 	"description": "test bill"
// }



orderConfirmHandlers._confirm.post = (data,callback) => {
  let userEmail = typeof(data.payload.email) == 'string' && data.payload.email.trim().indexOf('@') > -1 ? data.payload.email.trim():false;
  //const msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
  const amount = typeof(data.payload.amount) == 'string' && data.payload.amount.trim().length > 0 ? data.payload.amount.trim() : false;
  const currency = typeof(data.payload.currency) == 'string' && data.payload.currency.trim().length > 0 ? data.payload.currency.trim() : false;
  const description = typeof(data.payload.description) == 'string' && data.payload.description.trim().length > 0 ? data.payload.description.trim() : false;
    // Get token from headers
  let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    // Lookup the user email by reading the token
    _data.read('tokens',token,(err,tokenData) => {


        if(!err && tokenData){
            const userEmail = tokenData.email;

            _data.read('users',userEmail,(err,userData) => {

                if(!err && userData){

                     let userOrderConfirmation = typeof(userData.orderConfirmation) == 'object' && userData.orderConfirmation instanceof Array ? userData.orderConfirmation : [];// add new item to user's order array or add to new (empty) Array if user does not already have any checks
                     let totalBill = typeof(userData.orderTotal) == 'object' && userData.orderTotal instanceof Array ? userData.orderTotal : [];
                     let confirmId = helpers.createRandomString(20);

                     const msg = "Thank you for your order. You will receive an email confirmation shortly."
                     const currencyType = 'usd';
                     const description = 'Test bill';
                     const source = 'tok_mastercard';
                      //const amount = cartHandlers.totalBill;
                       let orderObject = {
                         'id' : confirmId,
                         'userEmail' : userEmail,
                         'amount': totalBill[0],
                         'currency': currencyType,
                         'description': description,
                         'source': source

                       };

                  _data.create('confirm',confirmId,orderObject, (err) => {

                    if(!err){

                      userData.orderConfirmation = userOrderConfirmation;
                      userData.orderConfirmation.push(confirmId);
                      //userData.orderConfirmation.push(msg);


                      const amount = orderObject.amount;
                      const msg = "Thank you for your order. You will receive an email confirmation shortly."
                      const currency = 'usd';
                      const description = 'Test bill';
                      const source = 'tok_mastercard';
                      helpers.sendStripeOrder({
                         amount,
                         currency,
                         source,
                         description,
                         callback

                       });

                        _data.update('users',userEmail,userData,(err) => {
                          if(!err){
                            const amount = totalBill;
                            const source = config.stripe.source;


                            helpers.sendMailGunEmail( userEmail,msg,callback );
                             // helpers.sendStripeOrder({
                             //    amount,
                             //    currency,
                             //    source,
                             //    description,
                             //    callback
                             //
                             //  });


                          }//end if !console.err();
                          else {
                            callback(500,{'Error' : 'Could not update the user with the new order info.'});
                          }

                        });//end _data.update('users',userEmail


                    }//end if(!err)


                  });//END _data.create('order',orderId,orderObject

                }//end if(!err && userData)


            });//end _data.read('users'


        }// end   if(!err && tokenData)
    });//end _data.read('tokens')



  };//end orderConfirmHandlers

// Export the orderConfirmHandlers
module.exports = orderConfirmHandlers;
