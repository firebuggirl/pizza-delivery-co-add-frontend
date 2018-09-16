# Page 4: Deleted Session

https://pirple.thinkific.com/courses/take/the-nodejs-master-class/lessons/3820327-page-4-deleted-session



- create `deleteSessionHandlers.sessionDeleted` + `sessionDeleted.html`

-  make modifications to `public/app.js` to `bind` any logout button so that it can trigger an actual logout

      - add ` <a href="#" id="logoutButton">Logout</a>` to `templates/_header.html `


      - create `app.bindLogoutButton` + `app.logUserOut`



- run `node index.js`

    - login w/ ` ms@smarty.com ` + ` password `

        - `http://localhost:7777/checks/all` will still show nothing, but go `home` to see that links have changed in navbar/header


        - click on `log out ` to log out...a `POST` was also made to delete `token` from both the server + the client side
