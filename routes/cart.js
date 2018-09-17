/*
 * Request cartHandlers
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


// Define all the cartHandlers
const cartHandlers = {};

// Not-Found
cartHandlers.notFound = (data,callback) => {
  callback(404);
};

// cart
cartHandlers.cart = (data,callback) => {
  const acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    cartHandlers._cart[data.method](data,callback);
  } else {
    callback(405);
  }
};

// Container for all the cart methods
cartHandlers._cart  = {};


// cart - post
// Required data: at least one item
// POST to cart EX: localhost:7777/api/cart
// Set Headers:
// Content-type: application/json
// Token: TOKEN_ID
// EX: POST request:
//     {
//       "name": "thin-crust",
//       "toppings": ["pepperoni", "peppers", "olives"],
//       "sizeChoice": [
//                 { "_id": "large", "price": 18 }
//                 ]
//         }


cartHandlers._cart.post = (data,callback) => {

 let name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
 let toppings = typeof(data.payload.toppings) == 'object' && data.payload.toppings instanceof Array && data.payload.toppings.length > 0 ? data.payload.toppings : false;
 let sizeChoice = typeof(data.payload.sizeChoice) == 'string' && data.payload.sizeChoice.length > 0 ? data.payload.sizeChoice : false;
 let totalBill = typeof(data.payload.totalBill) == 'string' && data.payload.totalBill.length > 0 ? data.payload.totalBill : false;


    // Get token from headers
    const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    // Lookup the user email by reading the token
    _data.read('tokens',token,(err,tokenData) => {
      if(!err && tokenData){
        const userEmail = tokenData.email;

        // Lookup the user data
        _data.read('users',userEmail,(err,userData) => {
          if(!err && userData){
            const userCartItems = typeof(userData.cartItems) == 'object' && userData.cartItems instanceof Array ? userData.cartItems : [];// add new item to user's order array or add to new (empty) Array if user does not already have any carts
              let userOrderTotal = typeof(userData.orderTotal) == 'object' && userData.orderTotal instanceof Array ? userData.orderTotal : [];

            // Verify that user has less than the number of max-cart per user
            if(userCartItems.length < config.maxCartItems){
              // Create random id for cart
              const cartId = helpers.createRandomString(20);


              // Create cart object including useremail
              function calculateBillTotal(preTaxAndTipAmount) {
                const tax = preTaxAndTipAmount * 0.0725;
                return preTaxAndTipAmount + tax ;
              }
              console.log(calculateBillTotal(parseInt(Math.round(sizeChoice * 100) / 100)));//bill before rounding tp 2nd decimal point

              //const totalBill = calculateBillTotal(parseInt(pizzaPrice));
              const unroundedBill = calculateBillTotal(parseInt(Math.round(sizeChoice * 100) / 100));

              const totalBill =  Math.ceil(unroundedBill * 100)/100;

              console.log(totalBill);


              let cartObject = {
                'id': cartId,
                'userEmail' : userEmail,
                'name': name,
                'toppings': toppings,
                'sizeChoice': sizeChoice,
                'totalBill': totalBill
              };

              // Save the object..persist data to disk..stored in `cart` collection
              _data.create('cart', cartId, cartObject, (err) => {
                if(!err){
                  // Add cart id to the user's object
                  userData.cartItems = userCartItems;
                  userData.cartItems.push(cartId);
                  //userData.cartItems.push(cartObject);

                  userData.orderTotal = userOrderTotal;
                  userData.orderTotal.push(cartObject.totalBill);
                  // Save the new user data
                  _data.update('users',userEmail,userData,(err) => {
                    if(!err){
                      // Return the data about the new order in the cart document/directory
                      callback(200,cartObject);
                      //callback(200,order);
                    } else {
                      callback(500,{'Error' : 'Could not update the user with the new order info.'});
                    }
                  });
                } else {
                  callback(500,{'Error' : 'Could not create the new order'});
                }
              });



            } else {
              callback(400,{'Error' : 'The user already has the maximum number of cart items ('+config.maxCartItems+').'})
            }


          } else {
            callback(403);
          }
        });


      } else {
        callback(403);
      }
    });

};


// cart - get
// Required data: id
// Optional data: none
// Set headers: Content-type: application/json + token = LOGGED_IN_USER_TOKEN
// GET localhost:7777/api/cart?id=CART_ID
cartHandlers._cart.get = (data,callback) => {
  // cart that id is valid
  const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

  if(id){
    // Lookup the cart
    _data.read('cart',id,(err,cartData) => {
      if(!err && cartData){
        // Get the token that sent the request
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        // Verify that the given token is valid and belongs to the user who created the cart
        //console.log("This is cart data",cartData.id);



        const cartUserEmail = cartData.userEmail;
        const itemName = cartData.name;
        const Toppings = cartData.toppings;
        const pizzaPrice = cartData.sizeChoice;


        console.log(cartData);


        function calculateBillTotal(preTaxAndTipAmount) {
          const tax = preTaxAndTipAmount * 0.0725;
          return preTaxAndTipAmount + tax ;
        }

        console.log(calculateBillTotal(parseInt(Math.round(pizzaPrice * 100) / 100)));//bill before rounding tp 2nd decimal point

        const unroundedBill = calculateBillTotal(parseInt(Math.round(pizzaPrice * 100) / 100));

        const totalBill =  Math.ceil(unroundedBill * 100)/100;

        console.log(totalBill);


        console.log(` This is the cart data for the logged in user with this cart ID ${cartData.id}. ${cartUserEmail} has ordered a ${itemName} pizza with the following toppings : ${Toppings}. The sub-total without tax is ${pizzaPrice} and the total with tax is ${totalBill}.`);



        tokenHandlers._tokens.verifyToken(token,cartData.userEmail,(tokenIsValid) => {
          if(tokenIsValid){
            // Return cart data
            callback(200,cartData);
          } else {
            callback(403);
          }
        });
      } else {
        callback(404);
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field, or field invalid'})
  }


};

// cart - put
// Required data: id
// Optional data: protocol,url,method,successCodes,timeoutSeconds (one must be sent)
cartHandlers._cart.put = (data,callback) => {

  // Check for required field
  let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  let name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
  let toppings = typeof(data.payload.toppings) == 'object' && data.payload.toppings instanceof Array && data.payload.toppings.length > 0 ? data.payload.toppings : false;
  let sizeChoice = typeof(data.payload.sizeChoice) == 'string' && data.payload.sizeChoice.length > 0 ? data.payload.sizeChoice : false;
  let totalBill = typeof(data.payload.totalBill) == 'string' && data.payload.totalBill.length > 0 ? data.payload.totalBill : false;


  // Error if id is invalid
    if(id){
      // Error if nothing is sent to update
      if(name || toppings || sizeChoice || totalBill){
        // Lookup the cart data
        _data.read('cart',id,(err,cartData) => {
          if(!err && cartData){
            // Get the token that sent the request
            let token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
            // Verify that the given token is valid and belongs to the user who created the data in cart
            tokenHandlers._tokens.verifyToken(token,cartData.userEmail,(tokenIsValid) => {
              if(tokenIsValid){
                // Update cart data where necessary
                if(name){
                  cartData.name = name;
                }
                if(toppings){
                  cartData.toppings = toppings;
                }
                if(sizeChoice){
                  cartData.sizeChoice = sizeChoice;
                }
                if(totalBill){
                  cartData.totalBill = totalBill;
                }


                // Store the new updates
                _data.update('cart',id,cartData,(err) => {
                  if(!err){
                    callback(200);
                  } else {
                    callback(500,{'Error' : 'Could not update the cart.'});
                  }
                });
              } else {
                callback(403);
              }
            });
          } else {
            callback(400,{'Error' : 'cart ID did not exist.'});
          }
        });
      } else {
        callback(400,{'Error' : 'Missing fields to update.'});
      }
    } else {
      callback(400,{'Error' : 'Missing required field.'});
    }

};


// cart - delete
// Required data: id
// Optional data: none
cartHandlers._cart.delete = (data,callback) => {
  // Check that id is valid
    const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id){
      // Lookup the cart data
      _data.read('cart',id,(err,cartData) => {
        if(!err && cartData){
          // Get the token that sent the request
          const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
          // Verify that the given token is valid and belongs to the user who created the check
          tokenHandlers._tokens.verifyToken(token,cartData.userEmail,(tokenIsValid) => {
            if(tokenIsValid){

              // Delete the cart data
              _data.delete('cart',id,(err) => {
                if(!err){
                  // Lookup the user's object to get all cart data
                  _data.read('users',cartData.userEmail,(err,userData) => {
                    if(!err){
                      const userCartItems = typeof(userData.cartItems) == 'object' && userData.cartItems instanceof Array ? userData.cartItems : [];

                      // Remove the deleted cart data
                      const cartPosition = userCartItems.indexOf(id);
                      if(cartPosition > -1){
                        userCartItems.splice(cartPosition,1);
                        // Re-save the user's data
                        userData.cart = userCartItems;
                        _data.update('users',cartData.userEmail,userData,(err) => {
                          if(!err){
                            callback(200);
                          } else {
                            callback(500,{'Error' : 'Could not update the user.'});
                          }
                        });
                      } else {
                        callback(500,{"Error" : "Could not find the cart items array on the user's object, so could not remove it."});
                      }
                    } else {
                      callback(500,{"Error" : "Could not find the user who created the cart/order, so could not remove the cart array from the list of cart items on their user object."});
                    }
                  });
                } else {
                  callback(500,{"Error" : "Could not delete the cart data."})
                }
              });
            } else {
              callback(403);
            }
          });
        } else {
          callback(400,{"Error" : "The cart ID specified could not be found"});
        }
      });
    } else {
      callback(400,{"Error" : "Missing valid id"});
    }
};


// Export the cartHandlers
module.exports = cartHandlers;
