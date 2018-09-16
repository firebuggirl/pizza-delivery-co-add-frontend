# Page 5 : Edit Account

https://pirple.thinkific.com/courses/take/the-nodejs-master-class/lessons/3820358-page-5-edit-account


- create `editAccountHandlers.accountEdit`

    - no need to add metadata in template data because this is a protected page....no reason to put meta description in head


- create `templates/accountEdit.html`

- make updates to `public/app.js`:


    - allow a page to have more than one form at a time

    - added helpers for loading data on a page when page is loaded


          - `app.loadDataOnPage `

          - `app.loadAccountEditPage`






- ` node index.js `


- `login`


      - ` ms@smarty.com `


      - ` password `


      - redirects to `http://localhost:7777/checks/all`, which hasn't been made yet.... go to `http://localhost:7777/` -> `account settings`...can see logged in user info...email is immutable
