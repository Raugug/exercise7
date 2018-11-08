const http = require("http");
const saveMessage = require("../clients/saveMessage");

module.exports = (message) => saveMessage({
    ...message,
    status: "PENDING"
  },
  function(result, err) {
      if (err){
          console.log("Error creating message", err);
          throw(err);
      }
  }) 