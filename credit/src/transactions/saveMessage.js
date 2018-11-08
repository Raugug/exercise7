const database = require("../database");
const Message = require("../models/message");
const { cleanClone } = require("../utils");

function saveMessageReplica(replica, retries) {
  if (retries > 0) {
    replica.markModified("body");
    return replica
      .save()
      .then(doc => {
        console.log("Message replicated successfully", doc);
        return doc;
      })
      .catch(err => {
        console.log("Error while saving message replica", err);
        console.log("Retrying...");
        return saveMessageReplica(replica, retries - 1);
      });
  }
}

function saveMessageTransaction(newValue, messageUuid) {
  const MessagePrimary = Message();
  const MessageReplica = Message("replica");

  let message = new MessagePrimary(newValue);

  return MessagePrimary.findOneAndUpdate({"uuid": messageUuid}, newValue, {new:true})
    .then(doc => {
      if (doc == null) {
        return message.save().then(doc => {
            console.log("Message saved successfully:", doc);
            return cleanClone(doc);
          })
        } else {
          console.log("Message updated successfully:", newValue);
          return cleanClone(doc);
        }
    })
    .then(clone => {
      let replica = new MessageReplica(newValue);
      saveMessageReplica(replica, 3);
      return clone;
    })
    .catch(err => {
      console.log("Error while saving message", err);
      throw err;
    });
}

module.exports = function(messageParams, cb, messageUuid) {
  saveMessageTransaction(messageParams, messageUuid)
    .then(() => cb())
    .catch(err => {
      cb(undefined, err);
    });
};
