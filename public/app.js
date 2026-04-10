const logText = document.getElementById('logText');
const qrBadge = document.getElementById('qrBadge');
const resultBadge = document.getElementById('resultBadge');
const apiKeyText = document.getElementById('apiKeyText');
const curlCommandText = document.getElementById('curlCommandText');
const reloadButton = document.getElementById('reloadButton');
const copyButton = document.getElementById('copyButton');

let loginContext = null;
let handledCode = '';

function appendLog(message) {
  const timestamp = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  logText.textContent = `[${timestamp}] ${message}\n${logText.textContent}`.trim();
}

function setQrBadge(text, className = '') {
  qrBadge.textContent = text;
  qrBadge.className = `badge ${className}`.trim();
}

function setResultBadge(text, className = '') {
  resultBadge.textContent = text;
  resultBadge.className = `badge ${className}`.trim();
}

function buildCurlCommand(apiKey) {
  const key = apiKey || '<YOUR_API_KEY>';
  return `curl 'https://mmgrcalltoken.3g.qq.com/aizone/v1/chat/completions' \\
  -H 'Authorization: Bearer ${key}' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "model": "modelroute",
    "messages": [
      { "role": "user", "content": "hi" }
    ],
    "max_tokens": 64
  }'`;
}

function renderCurlCommand(apiKey) {
  curlCommandText.textContent = buildCurlCommand(apiKey);
}

async function requestJson(url, options) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    const message = payload?.message || `HTTP ${response.status}`;
    const error = new Error(message);
    error.payload = payload;
    throw error;
  }

  return payload;
}

function renderQr(loginInfo) {
  const container = document.getElementById('wx_login');
  container.innerHTML = '';

  if (typeof window.WxLogin !== 'function') {
    throw new Error('WxLogin 脚本没有加载成功');
  }

  new window.WxLogin({
    self_redirect: true,
    id: 'wx_login',
    appid: loginInfo.appid,
    scope: 'snsapi_login',
    redirect_uri: encodeURIComponent(loginInfo.redirectUri),
    state: loginInfo.state,
    style: 'white',
    href: `data:text/css;base64,${loginInfo.wxLoginStyleBase64}`,
    onReady(ready) {
      if (ready) {
        setQrBadge('二维码已就绪', 'ok');
        appendLog('二维码加载完成，等待微信扫码。');
      }
    },
    onQRcodeReady() {
      appendLog('微信登录组件已生成二维码。');
    },
  });
}

async function initLogin() {
  handledCode = '';
  apiKeyText.textContent = '等待扫码完成...';
  renderCurlCommand('');
  copyButton.disabled = true;
  setQrBadge('初始化中');
  setResultBadge('未完成', 'muted');
  appendLog('开始初始化二维码登录。');

  const payload = await requestJson('/api/login/start');
  loginContext = payload;
  renderQr(payload);
}

async function exchangeCodeForApiKey(code) {
  if (!loginContext) {
    throw new Error('当前没有有效的二维码会话');
  }

  setQrBadge('已扫码', 'ok');
  appendLog(`收到扫码回调 code，开始换取登录态。`);

  const callbackResult = await requestJson('/api/login/callback', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });

  appendLog(
    `登录回调成功，loginKey=${callbackResult.hasLoginKey ? 'yes' : 'no'}，jwt=${callbackResult.hasJwtToken ? 'yes' : 'no'}。`
  );

  setResultBadge('登录成功', 'ok');
  appendLog('开始请求 4055 生成 apiKey。');

  const apiKeyResult = await requestJson('/api/login/apikey', {
    method: 'POST',
    body: JSON.stringify({}),
  });

  apiKeyText.textContent = apiKeyResult.apiKey;
  renderCurlCommand(apiKeyResult.apiKey);
  copyButton.disabled = false;
  setResultBadge('apiKey 已获取', 'ok');
  appendLog('apiKey 获取成功。');
}

window.addEventListener('message', async (event) => {
  const payload = event.data;
  if (!payload || payload.type !== 'sendCode' || !payload.data) {
    return;
  }
  if (payload.data === handledCode) {
    return;
  }
  handledCode = payload.data;

  try {
    await exchangeCodeForApiKey(payload.data);
  } catch (error) {
    setResultBadge('失败', 'error');
    appendLog(`回调处理失败: ${error.message}`);
    if (error.payload) {
      appendLog(`服务端详情: ${JSON.stringify(error.payload)}`);
    }
  }
});

reloadButton.addEventListener('click', async () => {
  try {
    await initLogin();
  } catch (error) {
    setQrBadge('初始化失败', 'error');
    appendLog(`初始化失败: ${error.message}`);
  }
});

copyButton.addEventListener('click', async () => {
  const value = apiKeyText.textContent.trim();
  if (!value || value === '等待扫码完成...') {
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
    appendLog('apiKey 已复制到剪贴板。');
  } catch (error) {
    appendLog(`复制失败: ${error.message}`);
  }
});

initLogin().catch((error) => {
  setQrBadge('初始化失败', 'error');
  appendLog(`初始化失败: ${error.message}`);
});
