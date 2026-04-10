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

## API 服务地址

当前已验证可直接调用的聊天补全接口地址：

```text
https://mmgrcalltoken.3g.qq.com/aizone/v1/chat/completions
```

请求方式：

```bash
curl 'https://mmgrcalltoken.3g.qq.com/aizone/v1/chat/completions' \
  -H 'Authorization: Bearer <YOUR_API_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "modelroute",
    "messages": [
      { "role": "user", "content": "hi" }
    ],
    "max_tokens": 64
  }'
```

## 可调用模型

基于当前实测，下面这些模型已验证可以正常调用：

- `modelroute`
- `deepseek-v3.2`

模型通过请求体里的 `model` 字段指定，例如：

```json
{
  "model": "deepseek-v3.2",
  "messages": [
    { "role": "user", "content": "你好" }
  ],
  "max_tokens": 64
}
```
