# Create checkout

- create `checkout.html`

- create `routes/checkout.js`

- add `<th>Checkout</th>` to `templates/orderTotalEdit.html`

- add this to `app.js`

    `  if(formId == 'checkout'){
          window.location = '/order/checkout';
        } `

- add ` td5.innerHTML = '<a href="/order/checkout?id='+responsePayload.id+'">Checkout</a>'; `
 to `app.js`
