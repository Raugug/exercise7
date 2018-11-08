const http = require("http");
const express = require("express");
const handleRequest = require("./src/queue/queue")
const worker = require("./src/queue/worker")
const bodyParser = require("body-parser");
const {
  Validator,
  ValidationError
} = require("express-json-validator-middleware");
const getMessages = require("./src/controllers/getMessages");
const updateCredit = require("./src/controllers/updateCredit");
const getMessageStatus = require("./src/controllers/getMessageStatus");

const app = express();


const validator = new Validator({ allErrors: true });
const { validate } = validator;

const messageSchema = {
  type: "object",
  required: ["destination", "body"],
  properties: {
    destination: {
      type: "string"
    },
    body: {
      type: "string"
    },
    location: {
      name: {
        type: "string"
      },
      cost: {
        type: "number"
      }
    }
  }
};

const creditSchema = {
  type: "object",
  required: ["amount"],
  properties: {
    location: {
      type: "string"
    },
    amount: {
      type: "number"
    }
  }
};

app.post(
  "/messages",
  bodyParser.json(),
  validate({ body: messageSchema }),
  handleRequest
  //sendMessage
);

app.post(
  "/credit",
  bodyParser.json(),
  validate({ body: creditSchema }),
  updateCredit
);

app.get("/messages", getMessages);
app.get("/message/:messageId/status", getMessageStatus);

app.use(function(err, req, res, next) {
  console.log(res.body);
  if (err instanceof ValidationError) {
    res.sendStatus(400);
  } else {
    res.sendStatus(500);
  }
});

app.listen(9017, function() {
  console.log("App credit started on PORT 9017");
});
