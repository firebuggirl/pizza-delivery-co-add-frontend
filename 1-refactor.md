# Refactoring for a GUI

https://pirple.thinkific.com/courses/take/the-nodejs-master-class/lessons/3810961-refactoring-for-a-gui


- create new routes in `lib/server.js`


    - append `api` to `users`, `tokens`, and `checks` path(s)...have done this already



- Modify server so that it can support `HTML` content types in addition to JSON w/in `unifiedServer` function:

    - add 3rd parameter to `chosenHandler`:

          - ` contentType `

          - `  contentType = typeof(contentType) == 'string' ? contentType : 'json'; `//// Determine the type of response (fallback to JSON)



          - in `lib/handlers.js`:

            - create separate sections for `JSON` and `HTML` handlers


            - in `lib/helpers.js`:


                - create `getTemplate` method/function

                - + add dependencies `path` + `fs`



- create `templates` directory


      - create `index.html`


- View headers in Postman via `GET`:

   `localhost:7777`
