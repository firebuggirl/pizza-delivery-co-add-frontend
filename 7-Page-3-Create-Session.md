# Page 3: Create a Session


- modify/create account function so that users are auto logged in when account is created

      - in `lib/handlers`:


          - create `handlers.sessionCreate`


- `touch templates/sessionCreate.html`


- add new logic to `public/app.js`:




-  Test Login

  - `node index.js`

  - sign in with `5551234567` for phone # + `thisisapassword` for password + go to `.data/tokens` to see that new token has been created ...session has been created and token has been created on the client side
