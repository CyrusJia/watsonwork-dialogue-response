# Watsonwork Event Listening and State Saving

A sample Watson Work app to demonstrate event listening and state saving
functionality.

## Files of interested

#### src/app.js

Starting on line 44, we see

```
// Handle events
events.onEvent(req.body, appId, token,
    (message, user) => {

      // Run with any previously saved action state
      state.run(spaceId, user.id, store, (astate, cb) => {

        // demo of states being saved
        // astate has a variable named "hasSentAlready", undefined initially
        if(astate.hasSentAlready)
          send(customMessage('I have already received my first event!'));

        // have "hasSentAlready" hasn't been set yet,
        // send message to Watson Workspace
        else {
          send(customMessage('Hello! I just received my first event!'));
          astate.hasSentAlready = true;
        }

        // Return the new action state
        cb(null, astate);
      });
    });

```

This function is called upon any event occurring within the space. The events listened to depends on the events selected when setting up the Webhook. In this example, we choose a webhook that responds to *message-created* events, so this code is ran every time a message is created in the Watson Workspace.

*send()* sends a message from the app to the Watson Workspace, allowing the app to chat with the users within the Watson Workspace.

*state.run()* is a function which calls up the previous state which contains past information. Think of it as this chat app having memory or being context aware.

The name of the state is called *astate*. Initially, when a user sends their first message to Watson Workspace, *userHasSentMessageAlready* is undefined, and the if condition is not met. The app sends "*Hello! I have just received my first event!*"
astate.userHasSentMessageAlready is defined and set to true.

When the user sends their second message to Watson Workspace, this astate is passed into *state.run()* and this time, *astate.hasSentAlready* was already set to true, and the app sends "*I have already received my first event!*" to Watson Workspace.


#### src/events.js


## Setup

### Deploying the app to IBM Bluemix

If you want to give the sample app a quick try using [Bluemix]
(https://bluemix.net), you can simply get it deployed to Bluemix straight
from Github without even having to download it to your local development
environment and build it yourself. Just click the button below:

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/CyrusJia/watsonwork-states-and-events&branch=master)

Once that's done, go to your
[Bluemix Dashboard](https://console.ng.bluemix.net/dashboard/cf-apps). The
app you've just deployed should be listed on that page. Write down its
**route** public URL (usually `https://<bluemix app name>.mybluemix.net`)
as you will need it later to register the app's Webhook endpoint with
the Watson Work platform.

### Building the app locally

You can skip this if you've just deployed the app directly to Bluemix.

To build the app in your local development environment, follow these steps:

Install Node.js 6+.

In a terminal window, do the following:
```sh
# For more verbose output
export DEBUG=watsonwork-*

# Get the code
git clone https://github.com/CyrusJia/watsonwork-states-and-events

# Build the app
cd watsonwork-states-and-events
npm run build
```

### Registering the app with Watson Work

In your Web browser, go to [Watson Work Services / Apps]
(https://workspace.ibm.com/developer/apps) and add a new app with any name, with a Webhook configured for the **message-created** event.

Set the Webhook **Callback URL** to a public URL targeting the server where
you're planning to run the sample app,
`https://<your server hostname>/webhook` for example, or
`https://<bluemix app name>.mybluemix.net/webhook` if you've deployed it
to Bluemix.


Save the app and write down its app id, app secret and Webhook secret.

### Starting the app on Bluemix

Go to your
[Bluemix Dashboard](https://console.ng.bluemix.net/dashboard/cf-apps),
select your app and under **Runtime** / **Environment Variables** /
**User Defined**, add the following variables:

```
APP_ID: <the app id>                                      
APP_SECRET: <the app secret>                              
WEBHOOK_SECRET: <the Webhook secret>
DEBUG: watsonwork-*
```

Click the **> Start** button to start the app.

### Launching the app from the Bluemix DevOps Services IDE

If you've followed the above steps to deploy the app to Bluemix, it is now
also set up as a project in the [Bluemix DevOps Services](https://hub.jazz.net)
Web IDE, allowing you to edit and manage the app directly from within the IDE.

You can skip this step if you're not planning to use that Web IDE. To enable
the app to be launched directly from the IDE, edit its
[Launch Configuration](https://hub.jazz.net/tutorials/livesync/#launch_configuration)
and under **Manifest Settings**, set its launch **Command** to:

```
npm install babel-cli@6.10.1 && npm run babel && npm start
```

### Starting the app locally

You can skip this if you've just started the app on Bluemix.

In the terminal window, do the following:
```
# Configure the app id and app secret
export APP_ID=<the app id>
export APP_SECRET=<the app secret>
export WEBHOOK_SECRET=<the Webhook secret>
```

The Watson Work platform requires Webhook endpoints to use HTTPS. The
sample app listens on HTTPS port 443 and can be configured to use an SSL
certificate like follows:
```
# Configure the SSL certificate
export SSLCERT=<path to your SSL certificate in PEM format>
export SSLKEY=<path to your SSL certificate key in PEM format>

# Start the app
npm start
```

You can also use a different HTTPS port number and a self-signed certificate,
like follows:
```
# Configure the HTTPS port number
export SSLPORT=8443

# Generate a self-signed SSL certificate with /CN set to your server's
# FQDN (fully qualified domain name), www.yourcompany.com for example
openssl req -nodes -new -x509 -keyout server.key -out server.crt -subj "/CN=your server's FQDN"
export SSLCERT=server.crt
export SSLKEY=server.key

# Start the app
npm start
```

If you're running behind a HTTPS proxy, you may want to have the app listen
on HTTP instead to let the proxy handle the HTTPS to HTTP conversion, like
follows:
```
# Configure the HTTP port
export PORT=8080

# Start the app
npm start
```

Finally, if the app is running on your development machine and you don't
want to set up a public IP and domain name for it yourself, you can also
use one the tunnel tools popular for Webhook development like
[localtunnel](https://localtunnel.github.io/www/) or
[ngrok](https://ngrok.com) for example.

Here's how to use a tunnel with localtunnel:

```
# Install the localtunnel module
npm install -g localtunnel

# Set up a tunnel from https://<subdomain name>.localtunnel.me
# to localhost:8080
lt --subdomain <pick a subdomain name> --port 8080

# Configure the app HTTP port
# No need for HTTPS here as localtunnel handles it
export PORT=8080

# Start the app
npm start
```

You can now go back to
[Watson Work Services / Apps](https://workspace.ibm.com/developer/apps),  
edit the app and set its Webhook **Callback URL** to
`https://<subdomain name>.localtunnel.me/webhook`.

### Enabling the app Webhook

Now that the app is running and listening for HTTPS requests at a public URL,
you're ready to **enable** its Webhook on the Watson Work platform.

Go back to
[Watson Work Services / Apps](https://workspace.ibm.com/developer/apps),
edit the app and set its Webhook to **Enabled**. Watson Work will
ping the app Webhook callback URL with a verification challenge request to
check that it's up and responding correctly.

The sample app will respond to that challenge request and output the
following log:
```
watsonwork-debug-sign Got Webhook verification challenge
```

### Chatting with the app in a space

You're now ready to chat with the sample app!

Go to [Watson Workspace](https://workspace.ibm.com) and create a space
named **Examples**, then open the **Apps** tab for that space and add the app to it.

In the **Examples** space, type any message you want. The app should reply with "*Hello! I just received my first event!*" Any subsequent message you type should be faced with the response: "*I have already received my first event!*"

## Project layout

The sample project source tree is organized as follows:

```sh
README.md     - this README
package.json  - Node.js package definition
watson.json   - Watson Conversation training configuration

src/          - Javascript sources

  app.js      - main app conversation handling script
  events.js   - routes Webhook events to app logic
  messages.js - reads and sends messages
  graphql.js  - runs GraphQL queries
  oauth.js    - obtains OAuth tokens for the app
  sign.js     - signs and verifies Webhook requests and responses
  state.js    - stores conversation state in a database
  users.js    - queries user profile info
  ssl.js      - configures the app to use an SSL certificate

  test/       - unit tests
```

## What API does the app use?

The app leverages the Watson Work Services to determine necessary app actions.

It uses the [Watson Work OAuth API](https://workspace.ibm.com/developer/docs)
to authenticate and get an OAuth token.

It implements a Webhook endpoint according to the
[Watson Work Webhook API](https://workspace.ibm.com/developer/docs) to
listen to conversations in a space and receive messages and message
annotations.

Finally, it uses the [Watson Work Spaces API](https://workspace.ibm.com/developer/docs)
to send messages to the space.

## How can I contribute?

Pull requests welcome!
