// 
// /*
//  * Request checkoutHandlers
//  *
//  */
//
// // Dependencies
// const _data = require('../lib/data');
// const helpers = require('../lib/helpers');
// const config = require('../lib/config');
// const tokenHandlers = require('./tokens');
//
//
// // Define all the checkoutHandlers
// const checkoutHandlers = {};
//
//
// // Create a new checkout
// checkoutHandlers.checkout = (data,callback) => {
//   let acceptableMethods = ['POST'];
//
//   if(acceptableMethods.indexOf(data.method)){
//       checkoutHandlers._checkout[data.method](data,callback);
//   }
//   else{
//       callback(405);
//   }
// };
//
// checkoutHandlers._checkout  = {};
//
//
// checkoutHandlers._checkout.post = (data,callback) =>{
//     //let email = typeof(data.payload.email) == 'string' && data.payload.email.trim().indexOf('@') > -1 ? data.payload.email.trim():false;
// const email = typeof(data.payload.email) == 'string' && data.payload.email.length > 0 ? data.payload.email.trim() : false;
// const cartId = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
//
//     if(email){
//         // Get the toke from the headers
//         let token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
//         // Verify token is valid for email
//         tokenHandlers._tokens.verifyToken(token,email,(tokenIsValid) => {
//             if(tokenIsValid){
//                 // get the cart from email
//               if(cartId){//get cart id
//                 _data.read('cart', email, cartId, (err,cartData) => {
//                     if (!err && cartData) {
//                         _data.read('users',email,(err,userData) =>{
//                             if(!err && userData){
//                                 helpers.sendStripePayment(userData,cartData,(err,response) => {
//                                     if(!err){
//                                         helpers.sendMailGunEmail(userData,cartData,(userEmail,msg,callback) => {
//                                             if(!err){
//                                                 let checkoutData = {
//                                                     'cart' : cartData.totalBill,
//                                                     'user' : cartData.userEmail
//                                                     //'date' : Date.now()
//                                                 }
//                                                 var checkoutId = helpers.createRandomString(10);
//                                                 _data.create('checkout',checkoutId,checkoutData,(err,checkout) => {
//                                                     if(!err){
//
//                                                         callback(200);
//                                                     }
//                                                     else{
//                                                         callback(500);
//                                                     }
//                                                 });
//                                             }
//                                             else{
//                                                 callback(400,{"ERROR" : "EMAIL ERROR: " + err});
//                                             }
//                                         })
//                                     }
//                                     else{
//                                      callback(400,{"ERROR":err});
//                                     }
//                                 });
//                             }
//                             else{
//                                 callback(500,{"ERROR":"Error finding users."});
//                             }
//                         });
//                     }
//                     else {
//                         callback(400,{"Error": "Cart does not exist."});
//                     }
//                 });
//               }//end get cart ID
//             }
//             else{
//                 callback(403,{"Error": "Missing token from header"})
//             }
//         });
//     }
//     else{
//         callback(400,{"ERROR":"Missing required fields"})
//     }
// };
//
//
//
// // Not-Found
// checkoutHandlers.notFound = (data,callback) => {
//   callback(404);
// };
//
//
// // Export the checkoutHandlers
// module.exports = checkoutHandlers;
