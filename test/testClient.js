const { Process, log, Exception, WebSocket } = require("../dist/client/index");
require("dotenv").config();

function test() {
  throw new Exception("failure sid", 403);
}
function testError() {
  // throw new Exception("failure sid", 403);
  try {
    test();
  } catch (err) {
    console.log(err.message);
  }
}
function testLog() {
  log.Trace("%s %v", "name", { foo: "bar" });
  log.Error("%s %v", "name", { foo: "bar" });
}
function testWebsocket() {
  const socket = new WebSocket("ws://localhost:8080");
}
function testProcess() {
  const info = Process("utils.app.Inspect");
  console.log(info);
}

testProcess();
