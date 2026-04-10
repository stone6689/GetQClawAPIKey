# GetQClawAPIKey

一个本地网页工具，用微信扫码登录 QClaw，并在回调后展示可直接使用的明文 `apiKey`。

## 启动

```bash
node server.js
```

启动后访问：

```text
http://127.0.0.1:3210
```

## 功能

- 生成 QClaw 微信登录二维码
- 接收扫码回调并换取登录态
- 调用 `4055` 获取明文 `apiKey`
- 页面内展示接口文档和测试 `curl` 命令
