const getMessageStatus = require("../clients/getMessageStatus");

module.exports = function(req, res) {
  getMessageStatus({uuid: req.params.messageId}).then(message => {
    res.json(message[message.length-1].status);
  });
};
