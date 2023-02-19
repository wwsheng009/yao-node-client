const {
  Process,
  log,
  Exception,
  WebSocket,
  Query,
  Studio,
} = require("../dist/client/index");
// require("dotenv").config();

function testStuio() {
  Studio("echo.hello", "");
}
testStuio();
