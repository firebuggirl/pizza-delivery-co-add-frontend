# Homework Assignment #3

This is the third of several homework assignments you'll receive in this course. In order to receive your certificate of completion (at the end of this course) you must complete all the assignments and receive a passing grade.

How to Turn It In:

1. Create a public github repo for this assignment.

2. Create a new thread in the discussion forum and note "Homework Assignment #3" at the top of your post.

3. In that thread, discuss what you have built, and include the link to your Github repo.

The Assignment (Scenario):

It is time to `build a simple frontend for the Pizza-Delivery API` you created in Homework Assignment #2. Please create a web app that allows customers to:

1. `Signup` on the site

2. `View all the items` available to order

3. `Fill` up a shopping `cart`

4. `Place an order` (with fake credit card credentials), and `receive an email receipt`

This is an open-ended assignment. You can take any direction you'd like to go with it, as long as your project includes the requirements. It can include anything else you wish as well.

## NOTE:

### To start app:

  - ` cd https `

  - run ` openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
 `

  - ` nvm use 8.9 `//if not Node default


  - ` node index.js ` or ` nodemon index.js `


  - Set environment variables for Mailgun and Stripe


      - see `./notes-from-hmwork2-api/security.md`


      - Test send email via Mailgun:


      ` curl -s --user 'api:YOUR_API_KEY' \
      https://api.mailgun.net/v3/YOUR_DOMAIN_NAME/messages \
      -F from='Excited User <mailgun@YOUR_DOMAIN_NAME>' \
      -F to=YOU@YOUR_DOMAIN_NAME \
      -F to=bar@example.com \
      -F subject='Hello' \
      -F text='Testing some Mailgun awesomeness!' `//not working...unable to log in
