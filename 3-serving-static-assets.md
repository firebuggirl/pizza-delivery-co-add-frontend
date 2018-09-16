# Serving Static Assets

https://pirple.thinkific.com/courses/take/the-nodejs-master-class/lessons/3820227-serving-static-assets


- create `public` directory w/ asset files

      - add route to `lib/server.js`:


            ` 'public' : publicHandlers.public, `


      - create route for `favicon`:


              ` 'favicon.ico': faviconHandlers.favicon  `


- create handlers for `public` + `favicon`


- set additional headers for various `content types`....jpg, png, etc... in `lib/server.js`


- connect public directory to `lib/server.js`

    `  chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler; `



- create `helpers.getStaticAsset` method/function
