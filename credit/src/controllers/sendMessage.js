const http = require("http");
const saveMessage = require("../clients/saveMessage");
const getCredit = require("../clients/getCredit");

const random = n => Math.floor(Math.random() * Math.floor(n));

module.exports = function(req, res) {
  const body = JSON.stringify(req);
  var query = getCredit();
  let messageUuid = req.uuid;

  query.exec(function(err, credit) {
    if (err) return console.log(err);

    current_credit = credit[0].amount;

    if (current_credit > 0) {
      const postOptions = {
        //host: "messageapp",
        host: "localhost",
        port: 3000,
        path: "/message",
        method: "post",
        json: true,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        }
      };

      let postReq = http.request(postOptions);

      postReq.on("response", postRes => {
        if (postRes.statusCode === 200) {
          saveMessage(
            {
              ...req,
              status: "OK"
            },
            function(_result, error) {
              if (error) {
                res.statusCode = 500;
                res.end(error);
              } else {
                res.end(postRes.body);
              }
            },
            messageUuid
          );
        } else {
          console.error("Error while sending message");

          saveMessage(
            {
              ...req,
              status: "ERROR"
            },
            () => {
              res.statusCode = 500;
              res.end("Internal server error: SERVICE ERROR");
            },
            messageUuid
          );
        }
      });

      postReq.setTimeout(random(6000));

      postReq.on("timeout", () => {
        console.error("Timeout Exceeded!");
        postReq.abort();

        saveMessage(
          {
            ...req,
            status: "TIMEOUT"
          },
          () => {
            res.statusCode = 500;
            res.end("Internal server error: TIMEOUT");
          },
          messageUuid
        );
      });

      postReq.on("error", () => {});

      postReq.write(body);
      postReq.end();
    } else {
      res.statusCode = 500;
      res.end("No credit error");
    }
  });
};
