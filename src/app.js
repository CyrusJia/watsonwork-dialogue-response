// A sample app that listens to messages posted to a space in IBM
// Watson Workspace.

import express from 'express';
import * as util from 'util';
import * as bparser from 'body-parser';
import * as http from 'http';
import * as https from 'https';
import * as oauth from './oauth';
import * as ssl from './ssl';
import * as sign from './sign';
import * as messages from './messages';
import * as events from './events';
import * as state from './state';
import debug from 'debug';

// Debug log
const log = debug('watsonwork-debug-app');

// Handle events sent to the annotation Webhook at /webhook
export const webhook = (appId, store, token) =>
(req, res) => {
  // log('Received body %o', req.body);

  // Get the space containing the conversation that generated the event
  const spaceId = req.body.spaceId;

  // A utility function that sends a message back to the conversation in
  // that space
  const send = (message) => {
    messages.send(spaceId,
      message.title, message.text, message.actor, token());
  };

    // Respond to the Webhook right away, as any response messages will
    // be sent asynchronously
  res.status(201).end();

    // Handle events
  events.onEvent(req.body, appId, token,
      (message, user) => {

        // Run with any previously saved action state
        state.run(spaceId, user.id, store, (astate, cb) => {

          // state demonstration
          // if(astate.hasSentAlready)
          // {
          //   send(customMessage('I have already received my first event!'));
          // }
          // else {
          //   send(customMessage('Hello! I just received my first event!'));
          //   astate.hasSentAlready = true;
          // }

          // Return the new action state
          cb(null, astate);
        });
      });

};

// Custom message formatter
const customMessage = (msg) => ({
  text: util.format(msg)
});


    // Create Express Web app
export const webapp =
    (appId, secret, whsecret, store, cb) => {
      // Authenticate the app and get an OAuth token
      oauth.run(appId, secret, (err, token) => {
        if(err) {
          cb(err);
          return;
        }

        // Return the Express Web app
        cb(null, express()

        // Configure Express route for the app Webhook
        .post('/webhook',

        // Verify Watson Work request signature and parse request body
        bparser.json({
          type: '*/*',
          verify: sign.verify(whsecret)
        }),

        // Handle Watson Work Webhook challenge requests
        sign.challenge(whsecret),

        // Handle Watson Work Webhook events
        webhook(appId, state.store(store), token)));
      });
    };

    // App main entry point
const main = (argv, env, cb) => {
      // Create Express Web app
  webapp(
        env.APP_ID,
        env.APP_SECRET,
        env.WEBHOOK_SECRET,
        env.STORE,
        (err, app) => {
          if(err) {
            cb(err);
            return;
          }

          if(env.PORT) {
            // In a hosting environment like Bluemix for example, HTTPS is
            // handled by a reverse proxy in front of the app, just listen
            // on the configured HTTP port
            log('HTTP server listening on port %d', env.PORT);
            http.createServer(app).listen(env.PORT, cb);
          }

          else
          // Listen on the configured HTTPS port, default to 443
          ssl.conf(env, (err, conf) => {
            if(err) {
              cb(err);
              return;
            }
            const port = env.SSLPORT || 443;
            log('HTTPS server listening on port %d', port);
            https.createServer(conf, app).listen(port, cb);
          });
        });
};

if (require.main === module)
  main(process.argv, process.env, (err) => {
    if(err) {
      console.log('Error starting app:', err);
      return;
    }
    log('App started');
  });
