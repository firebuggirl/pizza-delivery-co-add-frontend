# Using Templates

https://pirple.thinkific.com/courses/take/the-nodejs-master-class/lessons/3815330-using-templates

- create `templates/_header.html` + `templates/_footer.html`

- create `lib/helpers.getTemplate `

- create `lib/helpers.addUniversalTemplates`

    - Add the universal header and footer to a string, and pass provided data object to header and footer for interpolation


- create `lib/helpers.interpolate`

    - + add to `helpers.getTemplate` callback + sanity check `data`

      - enables for the creation of `globals` via `lib/config`


            - `templateGlobals`


- Defining variables within templates w/ interpolation



    - `{body.class}` in `_header.html`= optional class -> good for implementing page-specific styles


    - add classes to menu for `log in` + `log out`


- in `lib/handlers.js`:


      - `handlers.index`


            - modify so that `index.html` is wrapped w/ header and footer


- test interpolated variables via Postman `GET` + test to see that index.html is wrapped w/ header and footer


    - `localhost:7777`
