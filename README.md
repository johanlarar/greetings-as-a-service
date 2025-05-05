# Greetings-as-a-service

In this package we've developed a million dollar idea, we're building a service that can greet anyone!

This repository is composed of a basic backend serving a json file, acting as our database. A frontend using events to create an interactive website in which a user can submit their name and get a greeting. We're saving each persons that we greet in our database i.e. the json file.

# Installation instructions

To install:

```
npm install
```

I recommend using `nodemon` when running the server, you can either install it globally on your computer with `npm install -g nodemon` or running it directly from cloud with `npx nodemon`.

# Running the server

To start the server with npx run `npx nodemon server.js`
Or if you've installed nodemon globally `nodemon server.js`
