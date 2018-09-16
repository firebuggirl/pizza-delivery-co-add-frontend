# Page-7: Create An Order


https://pirple.thinkific.com/courses/take/the-nodejs-master-class/lessons/3820384-page-7-create-a-check



- create `orderCreateHandlers.orderCreate` + `templates/orderCreate.html`



- update `public/app.js` -> enable reading of form checkboxes and select drop downs before the payload is sent off


- in `public/app.js` add a success handler for:

`  if(formId == 'cartCreate'){
    window.location = '/order/total';
  } `

- `node index.js` -> `log in` -> redirected to `http://localhost:7777/order/total` (doesn't exist yet...) -> go to `localhost:7777/checks/create` -> create new check(s)

- look in `.data/cart`...see new order created by logged in user
