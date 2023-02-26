# 使用 typescript 开发 yao 脚本

## yao 本地 js 文件调试

yao 在调用 js 脚本时会自动的插入一些 yao 引擎特有的 js 对象。比如 Process,Query，这些在 nodejs 里是没有的。如果我们直接使用 nodejs 直接去调用 js 脚本，遇到这些 yao 对象时，nodejs 就会报错，提示找不到这些对象。

想到的解决方法就是使用远程调用 api 的方法模拟出函数调用。

在 yao 服务端建立一个代理**服务端**。在 nodejs 环境里建立代理**客户端**。当在 nodejs 调用 yao 对象时，会远程调用 yao 服务端的 api 接口，并返回最终的值。

代理客户端 <<======>> 代理服务端。


