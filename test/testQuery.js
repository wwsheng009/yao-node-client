const {
  Process,
  log,
  Exception,
  WebSocket,
  Query,
} = require("../dist/client/index");
// require("dotenv").config();

function testProcess() {
  const info = Process("utils.app.Inspect");
  console.log(info);
}

function testQuery() {
  const ql = {
    from: "$ai.message",
    select: ["id", "model", "prompt", "completion"],
    wheres: [{ ":created": "创建时间", ">=": "1990-01-01" }],
    limit: 11,
    debug: true,
  };

  const qb = new Query();
  const res = qb.Run(ql);
  console.log(res);
}
testQuery();
