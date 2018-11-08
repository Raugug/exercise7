const Queue = require("bull");
const queue = new Queue("credit", "redis://127.0.0.1:6379");
const uuidv1 = require("uuid/v1");
const sendMessage = require("../controllers/sendMessage");
const createMessage = require("../controllers/createMessage");

module.exports = (req, res) => {
  let message = req.body;
  message.uuid = uuidv1();

  Promise.resolve(createMessage(message)).then(() => {
    queue.add(message).then(job => {
      res.end(`{"message status": http://localhost:9017/message/${message.uuid}/status`);
      //sendMessage(body)
    });
  });
};
