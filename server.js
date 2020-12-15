const express = require("express");
const app = express();
const port = 5000;
const fs = require("fs");

app.use(express.json());

const getDurationInMilliseconds = (start) => {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);

  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

var log = function (req, res, next) {
  const start = process.hrtime();
  let durationInMilliseconds = 0;
  res.on("close", () => {
    durationInMilliseconds = getDurationInMilliseconds(start);
  });
  console.log(durationInMilliseconds);
  const requestValue = {
    method: req.method,
    url: req.url,
    Duration: durationInMilliseconds.toLocaleString() + "ms",
  };
  fs.writeFileSync("./log.txt", JSON.stringify(requestValue, null, 2), {
    flag: "a",
  });
  next();
};

app.use(log);

app.get("/", (req, res) => {
  fs.readFile("./content.txt", (err, data) => {
    if (err) {
      console.log(err);
      res.statusCode = 500;
      res.end();
    } else {
      res.setHeader("Content-Type", "text/plain");
      res.statusCode = 200;
      res.write(data);
      res.end();
    }
  });
});

app.post("/text", (req, res) => {
  const newText = req.body;
  // req.body={"text":"blablabla"}
  fs.writeFileSync("./content.txt", newText.text, { flag: "a" });
  res.end();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
