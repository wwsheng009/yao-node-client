# 说明

在这个目录下可以使用 js 进行测试

在脚本文件中引用 yao api

```js
const { Process, log, Exception, WebSocket } = require("../dist/client/index");
```

如果发现环境变量不生效，可以手动引用

```js
require("dotenv").config();
```
