/*
 * Frontend Logic for application
 *
 */

// Container for frontend application
const app = {};

// Config
app.config = {
  'sessionToken' : false
};

// AJAX Client (for RESTful API)
app.client = {}

// Interface for making API calls
app.client.request = (headers,path,method,queryStringObject,payload,callback) => {

  // Set defaults
  headers = typeof(headers) == 'object' && headers !== null ? headers : {};
  path = typeof(path) == 'string' ? path : '/';
  method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof(payload) == 'object' && payload !== null ? payload : {};
  callback = typeof(callback) == 'function' ? callback : false;//allow requests even if there is not a callback

  // For each query string parameter sent, add it to the path
  let requestUrl = path+'?';
  let counter = 0;
  for(let queryKey in queryStringObject){
     if(queryStringObject.hasOwnProperty(queryKey)){
       counter++;
       // If at least one query string parameter has already been added, preprend new ones with an ampersand
       if(counter > 1){
         requestUrl+='&';//add ampersand if there is more than one query key value
       }
       // Add the key and value
       requestUrl+=queryKey+'='+queryStringObject[queryKey];
     }
  }

  // Form the http request as a JSON type
  let xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-type", "application/json");

  // For each header sent, add it to the request
  for(let headerKey in headers){
     if(headers.hasOwnProperty(headerKey)){
       xhr.setRequestHeader(headerKey, headers[headerKey]);
     }
  }

  // If there is a current session token set, add that as a header as well
  if(app.config.sessionToken){
    xhr.setRequestHeader("token", app.config.sessionToken.id);
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = () => {
      if(xhr.readyState == XMLHttpRequest.DONE) {
        let statusCode = xhr.status;
        let responseReturned = xhr.responseText;

        // Callback if requested
        if(callback){
          try{
            let parsedResponse = JSON.parse(responseReturned);
            callback(statusCode,parsedResponse);
          } catch(e){
            callback(statusCode,false);
          }

        }
      }
  };

  // Send the payload as JSON
  let payloadString = JSON.stringify(payload);
  xhr.send(payloadString);

};

// Bind the logout button
app.bindLogoutButton = () => {
  document.getElementById("logoutButton").addEventListener("click", (e) => {

    // Stop it from redirecting anywhere
    e.preventDefault();

    // Log the user out
    //app.logUserOut();

    auth.logUserOut(httpClient).then(() => {
        window.location = '/';
      });
    });

  //});
};

// Log the user out then redirect them
app.checkOut = (redirectUser) => {
  // Set redirectUser to default to true
  redirectUser = typeof(redirectUser) == 'boolean' ? redirectUser : true;

  // Get the current token id
  let tokenId = typeof(app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false;

  // Send the current token to the tokens endpoint to delete it
  let queryStringObject = {
    'id' : tokenId
  };
  app.client.request(undefined,'api/checkout','POST',queryStringObject,undefined,(statusCode,responsePayload) => {
    // Set the app.config token as false
    app.setSessionToken(false);

    // Send the user to the logged out page
    if(redirectUser){
      window.location = '/order/thankyou';
    }

  });
};
// Log the user out then redirect them
app.logUserOut = (redirectUser) => {
  // Set redirectUser to default to true
  redirectUser = typeof(redirectUser) == 'boolean' ? redirectUser : true;

  // Get the current token id
  let tokenId = typeof(app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false;

  // Send the current token to the tokens endpoint to delete it
  let queryStringObject = {
    'id' : tokenId
  };
  app.client.request(undefined,'api/tokens','DELETE',queryStringObject,undefined,(statusCode,responsePayload) => {
    // Set the app.config token as false
    app.setSessionToken(false);

    // Send the user to the logged out page
    if(redirectUser){
      window.location = '/session/deleted';
    }

  });
};

// Bind the forms
app.bindForms = () => {
  if(document.querySelector("form")){

    let allForms = document.querySelectorAll("form");
    for(let i = 0; i < allForms.length; i++){
        allForms[i].addEventListener("submit", function(e){

        // Stop it from submitting
        e.preventDefault();
        let formId = this.id;
        let path = this.action;
        let method = this.method.toUpperCase();

        // Hide the error message (if it's currently shown due to a previous error)
        document.querySelector("#"+formId+" .formError").style.display = 'none';

        // Hide the success message (if it's currently shown due to a previous error)
        if(document.querySelector("#"+formId+" .formSuccess")){
          document.querySelector("#"+formId+" .formSuccess").style.display = 'none';
        }


        // Turn the inputs into a payload
        let payload = {};
        let elements = this.elements;
        for(let i = 0; i < elements.length; i++){
          if(elements[i].type !== 'submit'){
            // Determine class of element and set value accordingly
            let classOfElement = typeof(elements[i].classList.value) == 'string' && elements[i].classList.value.length > 0 ? elements[i].classList.value : '';
            let valueOfElement = elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1 ? elements[i].checked : classOfElement.indexOf('intval') == -1 ? elements[i].value : parseInt(elements[i].value);
            let elementIsChecked = elements[i].checked;
            // Override the method of the form if the input's name is _method
            let nameOfElement = elements[i].name;
            if(nameOfElement == '_method'){
              method = valueOfElement;
            } else {
              // Create an payload field named "method" if the elements name is actually httpmethod
              if(nameOfElement == 'httpmethod'){
                nameOfElement = 'method';
              }

              // Create an payload field named "id" if the elements name is actually uid
              if(nameOfElement == 'uid'){
                nameOfElement = 'id';
              }


              // If the element has the class "multiselect" add its value(s) as array elements
              if(classOfElement.indexOf('multiselect') > -1){
                if(elementIsChecked){
                  payload[nameOfElement] = typeof(payload[nameOfElement]) == 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
                  payload[nameOfElement].push(valueOfElement);
                }
              } else {
                payload[nameOfElement] = valueOfElement;
              }

            }
          }
        }

        // If the method is DELETE, the payload should be a queryStringObject instead
        let queryStringObject = method == 'DELETE' ? payload : {};

        // Call the API
        app.client.request(undefined,path,method,queryStringObject,payload,(statusCode,responsePayload) => {
          // Display an error on the form if needed
          if(statusCode !== 200){

            if(statusCode == 403){
              // log the user out
              app.logUserOut();

            } else {

              // Try to get the error from the api, or set a default error message
              let error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';

              // Set the formError field with the error text
              document.querySelector("#"+formId+" .formError").innerHTML = error;

              // Show (unhide) the form error field on the form
              document.querySelector("#"+formId+" .formError").style.display = 'block';
            }
          } else {
            // If successful, send to form response processor
            app.formResponseProcessor(formId,payload,responsePayload);
          }

        });
      });
    }
  }
};

// Form response processor
app.formResponseProcessor = (formId,requestPayload,responsePayload) => {
  let functionToCall = false;
  // If account creation was successful, try to immediately log the user in
  if(formId == 'accountCreate'){
    // Take the email and password, and use it to log the user in
    let newPayload = {
      'email' : requestPayload.email,
      'password' : requestPayload.password
    };

    app.client.request(undefined,'api/tokens','POST',undefined,newPayload,(newStatusCode,newResponsePayload) => {
      // Display an error on the form if needed
      if(newStatusCode !== 200){

        // Set the formError field with the error text
        document.querySelector("#"+formId+" .formError").innerHTML = 'Sorry, an error has occured. Please try again.';

        // Show (unhide) the form error field on the form
        document.querySelector("#"+formId+" .formError").style.display = 'block';

      } else {
        // If successful, set the token and redirect the user
        app.setSessionToken(newResponsePayload);
        window.location = '/order/create';
      }
    });
  }
  // If login was successful, set the token in localstorage and redirect the user
  if(formId == 'sessionCreate'){
    app.setSessionToken(responsePayload);
    window.location = '/order/create';
  }

  // If forms saved successfully and they have success messages, show them
  let formsWithSuccessMessages = ['accountEdit1', 'accountEdit2', 'orderEdit1'];
  if(formsWithSuccessMessages.indexOf(formId) > -1){
    document.querySelector("#"+formId+" .formSuccess").style.display = 'block';
  }

  // If the user just deleted their account, redirect them to the account-delete page
  if(formId == 'accountEdit3'){
    app.logUserOut(false);
    window.location = '/account/deleted';
  }

  if(formId == 'checkout'){
    app.checkOut(true);
    //window.location = '/order/total';
  }

  // If the user just created a new order successfully, redirect back to the dashboard
  if(formId == 'cartCreate'){
    window.location = '/order/total';
    //window.location = '/order/total?id='+responsePayload.id;
  }

  // If the user just deleted a check, redirect them to the dashboard
  if(formId == 'cartEdit2'){
    window.location = '/order/total';
  }

};

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = () => {
  let tokenString = localStorage.getItem('token');
  if(typeof(tokenString) == 'string'){
    try{
      let token = JSON.parse(tokenString);
      app.config.sessionToken = token;
      if(typeof(token) == 'object'){
        app.setLoggedInClass(true);
      } else {
        app.setLoggedInClass(false);
      }
    }catch(e){
      app.config.sessionToken = false;
      app.setLoggedInClass(false);
    }
  }
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = (add) => {
  let target = document.querySelector("body");
  if(add){
    target.classList.add('loggedIn');
  } else {
    target.classList.remove('loggedIn');
  }
};

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = (token) => {
  app.config.sessionToken = token;
  let tokenString = JSON.stringify(token);
  localStorage.setItem('token',tokenString);
  if(typeof(token) == 'object'){
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};

// Renew the token
app.renewToken = (callback) => {
  let currentToken = typeof(app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
  if(currentToken){
    // Update the token with a new expiration
    let payload = {
      'id' : currentToken.id,
      'extend' : true,
    };
    app.client.request(undefined,'api/tokens','PUT',undefined,payload,(statusCode,responsePayload) => {
      // Display an error on the form if needed
      if(statusCode == 200){
        // Get the new token details
        let queryStringObject = {'id' : currentToken.id};
        app.client.request(undefined,'api/tokens','GET',queryStringObject,undefined,(statusCode,responsePayload) => {
          // Display an error on the form if needed
          if(statusCode == 200){
            app.setSessionToken(responsePayload);
            callback(false);
          } else {
            app.setSessionToken(false);
            callback(true);
          }
        });
      } else {
        app.setSessionToken(false);
        callback(true);
      }
    });
  } else {
    app.setSessionToken(false);
    callback(true);
  }
};

// Load data on the page
app.loadDataOnPage = () => {
  // Get the current page from the body class
  let bodyClasses = document.querySelector("body").classList;
  let primaryClass = typeof(bodyClasses[0]) == 'string' ? bodyClasses[0] : false;

  // Logic for account settings page
  if(primaryClass == 'accountEdit'){
    app.loadAccountEditPage();
  }

    // Logic for dashboard page
  if(primaryClass == 'displayTotal' || 'checkout'){//set class via routes/displayTotal.js
    app.loadOrderListPage ();
  }

  // Logic for check details page
  if(primaryClass == 'cartEdit'){//set class via routes/cartEdit.js
    app.loadTotalEditPage();
  }

  // if(primaryClass == 'checkout'){
  //     app.loadCheckoutPage();
  // }
};


// // Load the account edit page specifically
app.loadAccountEditPage = () => {
  // Get the email number from the current token, or log the user out if none is there
  let email = typeof(app.config.sessionToken.email) == 'string' ? app.config.sessionToken.email : false;
  if(email){
    // Fetch the user data
    let queryStringObject = {
      'email' : email
    };
    app.client.request(undefined,'api/users','GET',queryStringObject,undefined,(statusCode,responsePayload) => {
      if(statusCode == 200){
        // Put the data into the forms as values where needed
        document.querySelector("#accountEdit1 .firstNameInput").value = responsePayload.firstName;
        document.querySelector("#accountEdit1 .lastNameInput").value = responsePayload.lastName;
        document.querySelector("#accountEdit1 .addressInput").value = responsePayload.address;
        document.querySelector("#accountEdit1 .displayEmailInput").value = responsePayload.email;

        // Put the hidden email field into both forms
        let hiddenEmailInputs = document.querySelectorAll("input.hiddenEmailInput");
        for(let i = 0; i < hiddenEmailInputs.length; i++){
            hiddenEmailInputs[i].value = responsePayload.email;
        }

      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }



};



// Load the checks edit page specifically
app.loadTotalEditPage = () => {
  // Get the check id from the query string, if none is found then redirect back to dashboard
  let id = typeof(window.location.href.split('=')[1]) == 'string' && window.location.href.split('=')[1].length > 0 ? window.location.href.split('=')[1] : false;
  if(id){
    // Fetch the check data
    let queryStringObject = {
      'id' : id
    };
    app.client.request(undefined,'api/cart','GET',queryStringObject,undefined,(statusCode,responsePayload) => {
      if(statusCode == 200){

        // Put the hidden id field into both forms
        let hiddenIdInputs = document.querySelectorAll("input.hiddenIdInput");
        for(let i = 0; i < hiddenIdInputs.length; i++){
            hiddenIdInputs[i].value = responsePayload.id;
        }


        // const totalItems = responsePayload.name && responsePayload.name.length
        //   ? responsePayload.name.reduce((acc, item) => acc + name.quantity, 0)
        //   : 0;
        //const totalItems = responsePayload.name;
        //const numberOrders = totalItems.length;

        // const shoppingCartCounter = document.getElementById('shoppingCartCounter');
        // shoppingCartCounter.innerHTML = `${totalItems.length}`;
        const numberOrders = `${responsePayload.length}`;
        document.getElementById("shoppingCartCounter").innerHTML = numberOrders;
        // Put the data into the top form as values where needed
        document.querySelector("#orderEdit1 .displayIdInput").value = responsePayload.id;
        document.querySelector("#orderEdit1 .pizzaInput").value = responsePayload.name;
        document.querySelector("#orderEdit1 .sizeChoiceInput").value = responsePayload.sizeChoice;
        let toppingCheckboxes = document.querySelectorAll("#orderEdit1 input.toppingsInput");
        for(let i = 0; i < toppingCheckboxes.length; i++){
          if(responsePayload.toppings.indexOf(parseInt(toppingCheckboxes[i].value)) > -1){
            toppingCheckboxes[i].checked = true;
          }
        }
      } else {
        // If the request comes back as something other than 200, redirect back to dashboard
        window.location = '/order/total';
      }
    });
  } else {
    window.location = '/order/total';
  }
};




// Loop to renew token often
app.tokenRenewalLoop = () => {
  setInterval(() => {
    app.renewToken((err) => {
      if(!err){
        console.log("Token renewed successfully @ "+Date.now());
      }
    });
  },1000 * 60);
};



// Load the order page specifically
app.loadOrderListPage = () => {
  // Get the email number from the current token, or log the user out if none is there
//  let email = typeof(app.config.sessionToken.email) == 'string' ? app.config.sessionToken.email : false;
  let email = typeof(app.config.sessionToken.email) == 'string' ? app.config.sessionToken.email : false;
  if(email){
    // Fetch the user data
    let queryStringObject = {
      'email' : email
    };
    app.client.request(undefined,'api/users','GET',queryStringObject,undefined,(statusCode,responsePayload) => {
      if(statusCode == 200){

  document.querySelector(".firstNameInput").value = responsePayload.firstName;
  document.querySelector(".lastNameInput").value = responsePayload.lastName;
  //document.querySelector("#checkout .displayEmailInput").value = responsePayload.email;
  // document.querySelector("#checkout .displayCreditCardInput").value = 5555555555554444;
   document.querySelector(".displayAddressInput").value = responsePayload.address;
  // document.querySelector("#checkout .displayTotalInput").value = responsePayload.totalBill;
//         // Determine how many order items the user has
             let allOrderItems = typeof(responsePayload.cartItems) == 'object' && responsePayload.cartItems instanceof Array && responsePayload.cartItems.length > 0 ? responsePayload.cartItems : [];//'cartItems' = GET response from the API route /users via cart.js
            //  let allOrderItems = typeof(responsePayload.order) == 'object' && responsePayload.order instanceof Array && responsePayload.order.length > 0 ? responsePayload.order : [];
             if(allOrderItems.length > 0){

               // Show each created check as a new row in the table
               allOrderItems.forEach((cartId) => {
                 // Get the data for the check
                 let newQueryStringObject = {
                   'id' : cartId
                 };
                 app.client.request(undefined,'api/cart','GET', newQueryStringObject, undefined,(statusCode,responsePayload) => {
                   if(statusCode == 200){
                     document.querySelector(" .displayEmailInput").value = responsePayload.userEmail;
                     let cartData = responsePayload;
                     // Make the cart data into a table row
                     let table = document.getElementById("orderListTable");
                     let tr = table.insertRow(-1);
                     tr.classList.add('orderRow');
                     let td0 = tr.insertCell(0);
                     let td1 = tr.insertCell(1);
                     let td2 = tr.insertCell(2);
                     let td3 = tr.insertCell(3);
                     let td4 = tr.insertCell(4);
                     td0.innerHTML = responsePayload.name;
                     td1.innerHTML = responsePayload.toppings;
                     td2.innerHTML = responsePayload.sizeChoice;
                     td3.innerHTML = responsePayload.totalBill;
                     td4.innerHTML = '<a href="/cart/edit?id='+responsePayload.id+'">View / Edit / Delete</a>';



                     document.querySelector(".displayCreditCardInput").value = 5555555555554444;

                     document.querySelector(".displayTotalInput").value = responsePayload.totalBill;
                     const checkoutPath = document.getElementById('checkout');
                     //checkoutPath.setAttribute('action', '/api/checkout?id='+responsePayload.id+'');


                   } else {
                     console.log("Error trying to load cartId ID: ",cartId);
                   }
                 });
               });

               if(allOrderItems.length < 0){
                 // Show the createCheck CTA
                 document.getElementById("createOrderCTA").style.display = 'block';
               }


        } else {
          // Show 'you have placed no order' message
          document.getElementById("noOrderMessage").style.display = 'table-row';

          // Show the createCheck CTA
          document.getElementById("createOrderCTA").style.display = 'block';

        }


      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    });
  } else {
    //app.logUserOut();
    console.log("Thank you!")
  }
};




app.showHide = () => {


      document.getElementById('name').addEventListener('change', function () {
          const thinCrustIngredients = this.value == "thin-crust" ? 'block' : 'none';
          const medCrustIngredients = this.value == "medium-crust" ? 'block' : 'none';
          const deepDishIngredients = this.value == "deep-dish" ? 'block' : 'none';
          const vegan = this.value == "vegan-pizza" ? 'block' : 'none';
          const paleo = this.value == "paleo-crust-pizza" ? 'block' : 'none';


        if(thinCrustIngredients){
           document.getElementById('checkBox1').style.display = thinCrustIngredients;
         }


        if(medCrustIngredients){
          document.getElementById('checkBox2').style.display = medCrustIngredients;
        }


        if(deepDishIngredients){
            document.getElementById('checkBox3').style.display = deepDishIngredients;
          }

        if(vegan || paleo){
            document.getElementById('checkBox4').style.display = vegan;
            document.getElementById('checkBox5').style.display = paleo;
            checkBox1.style.display = 'none';

          }

      });



}


// Draw shopping cart counter details on the page.
// app.drawShoppingCartCounter = (shoppingCart) => {
//   const totalItems = shoppingCart.items && shoppingCart.items.length
//     ? shoppingCart.items.reduce((acc, item) => acc + item.quantity, 0)
//     : 0;
//   const shoppingCartCounter = document.getElementById('shoppingCartCounter');
//   shoppingCartCounter.innerHTML = `${totalItems}`;
// };




// Init (bootstrapping)
app.init = () => {


  // Get the token.
  const token = auth.getToken();
  app.setLoggedInClass(!!token);
  if (token) {
    // Set token to the http client default headers.
    httpClient.defaults.headers = {token: token.id};

    // Get shopping cart and update shopping cart number of items.
    // shoppingCart.getCart(httpClient)
    //   .then((shoppingCart) => {
    //     app.drawShoppingCartCounter(shoppingCart);
    //   });
  }


  // Bind all form submissions
  app.bindForms();

  // Bind logout logout button
  app.bindLogoutButton();

  // Bind all form submissions.
  formProcessor.bindForms(httpClient);
  // Get the token from localstorage
  app.getSessionToken();

  // Renew token
  app.tokenRenewalLoop();

  // Load data on page
  app.loadDataOnPage();

  // Show/hide toppings, depending on type of pizza selected...hide boxex other than default in CSS
  app.showHide();


};

// Call the init processes after the window loads
// window.onload = () => {
//   app.init();
// };

// Call the init processes after the window loads.
window.addEventListener('load', app.init);
