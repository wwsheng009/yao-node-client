## 支持哪些调用

- 语言翻译,可以直接使用$L 函数，注意在开发环境语言配置文件\*.yml 的修改不会自动重载，需要重启 yao 应用
- http 对象
- log 对象
- Exception 对象
- Query 类定义
- Store 类定义
- Process 函数
- FS 类定义
- WebSocket 定义

### 环境变量

在 yao 脚本中可以使用$.ENV.的方法引用环境变量，引擎会在系统加载时解析文本,根据变量 key 在查找并替换对应的变量 key。

.env

```
变量key=12345


"$ENV.变量key" //替换后变成了12345
```

在客户端里直接使用 process.env.HOME 引用变量变量，在生成脚本里进行修复
