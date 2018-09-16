# Page 3: Create a Session


- modify/create account function so that users are auto logged in when account is created



   - create `routes/sessionCreate`

        - `module.exports = sessionCreateHandlers;`


- `touch templates/sessionCreate.html`


- add new logic to `public/app.js`:

    - see:

        ` app.formResponseProcessor  `

        ` app.getSessionToken `

        ` app.setLoggedInClass `

        ` app.setSessionToken `

        ` app.renewToken `

        ` app.tokenRenewalLoop `



-  Test Login

  - `node index.js`

  - sign in with `ms@smarty.com` for email + `password` for password + go to `.data/tokens` to see that new token has been created ...session has been created and token has been created on the client side
