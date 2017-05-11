// Utility functions to work with Watson Work Webhook events

import * as messages from './messages';
// import * as util from 'util';
import debug from 'debug';

// Setup debug log
const log = debug('watsonwork-debug-events');

// Call a callback function with the info extracted from an annotation
// event, the original annotated message and the user who sent it
const callback = (evt, appId, info, annotation, token, cb) => {

  // Retrieve the annotated message
  messages.message(evt.messageId, token(), (err, message) => {
    if(err)
      return;

    // Ignore messages from the app itself
    if(message.createdBy.id === appId)
      return;

    // Return the extracted info, annotation, annotated message
    // and the user who sent it
    // log('Message %s',
    //   util.inspect(message, { colors: debug.useColors(), depth: 10 }));
    cb(info, annotation, message, message.createdBy);
  });
};


// Return the event identified
export const onEvent = (evt, appId, token, cb) => {
  let info = evt.content;
  let annotation = evt;

  // callback
  if(evt.type === 'message-annotation-added')
    callback(evt, appId, info, annotation, token, cb);
};
