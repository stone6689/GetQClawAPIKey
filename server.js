const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 3210);
const JPRX_BASE_URL = 'https://jprx.m.qq.com';
const APP_VERSION = '1.4.0';
const APP_ENV = 'release';
const COOKIE_NAME = 'qclaw_sid';
const PUBLIC_DIR = path.join(__dirname, 'public');

const WX_LOGIN_INFO = {
  appid: 'wx9d11056dd75b7240',
  redirectUri: 'https://security.guanjia.qq.com/login',
  wxLoginStyleBase64:
    'LnN0YXR1c19pY29uIHsNCiAgICBkaXNwbGF5OiBub25lDQogIH0NCiAgLmltcG93ZXJCb3ggLnN0YXR1cyB7DQogICAgdGV4dC1hbGlnbjogY2VudGVyOw0KICB9DQogIC5pbXBvd2VyQm94IC5sb2dpblBhbmVsLm5vcm1hbFBhbmVsIC50aXRsZXsNCiAgICBkaXNwbGF5OiBub25lOw0KICB9DQogIC5pbXBvd2VyQm94IC5sb2dpblBhbmVsLm5vcm1hbFBhbmVsIC5xcmNvZGUgew0KICAgIG1hcmdpbi10b3A6IDQwcHg7DQogICAgd2lkdGg6IDEyMHB4Ow0KICAgIGhlaWdodDogMTIwcHg7DQogICAgYm9yZGVyOiAwcHg7DQogICAgLy8gYm9yZGVyLXJhZGl1czogNXB4Ow0KICB9DQogIC5pbXBvd2VyQm94IC5zdGF0dXMgew0KICAgIHBhZGRpbmc6IDAgMDsNCiAgICB0ZXh0LWFsaWduOiBjZW50ZXINCiAgfQ0KICAuaW1wb3dlckJveCAuc3RhdHVzIC5zdGF0dXNfdHh0LA0KICAuaW1wb3dlckJveCAuc3RhdHVzLnN0YXR1c19icm93c2VyIHA6bnRoLWNoaWxkKDIpIHsNCiAgICBjb2xvcjogIzAwMDAwMDs7DQogICAgZm9udC1zaXplOiAxNnB4Ow0KICAgIGxpbmUtaGVpZ2h0OiAyMXB4Ow0KICB9DQogIC5pbXBvd2VyQm94IC5zdGF0dXMgLnN0YXR1c190eHR7DQogICAgd2lkdGg6IDEzMHB4Ow0KICAgIGhlaWdodDogMTMwcHg7DQogICAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjYpOw0KICAgIGJvcmRlci1yYWRpdXM6IDVweDsNCiAgICBwb3NpdGlvbjogYWJzb2x1dGU7DQogICAgdG9wOiAzMHB4Ow0KICAgIGxlZnQ6IDUwJTsNCiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7DQogIH0NCg0KICAuaW1wb3dlckJveCAuc3RhdHVzIC5zdGF0dXNfdHh0IGg0IHsNCiAgICBtYXJnaW46IDU2cHggYXV0bzsNCiAgICBkaXNwbGF5OiBmbGV4Ow0KICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47DQogICAgYWxpZ24taXRlbXM6IGNlbnRlcjsNCiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47DQogICAgbWluLXdpZHRoOiA1NnB4Ow0KICAgIG1pbi1oZWlnaHQ6IDYwcHg7IA0KICAgIGNvbG9yOiAjRkZGRkZGOw0KICAgIGZvbnQtd2VpZ2h0OiA0MDA7DQogICAgZm9udC1zaXplOiAxNHB4Ow0KICAgIGxpbmUtaGVpZ2h0OiAyMHB4Ow0KICAgIHRleHQtYWxpZ246IGNlbnRlcjsNCiAgfQ0KICAuaW1wb3dlckJveCAuc3RhdHVzIC5zdGF0dXNfdHh0IGg0OjpiZWZvcmV7DQogICAgd2lkdGg6IDMwcHg7DQogICAgaGVpZ2h0OiAzMHB4Ow0KICAgIGNvbnRlbnQ6ICYjMzk7JiMzOTs7DQogICAgYmFja2dyb3VuZDogdXJsKCYjMzk7aHR0cHM6Ly93ZWJjZG4ubS5xcS5jb20vOTlhN2NlYWE4ZDQwY2MxMjI1ZjQ1NzA2NTRkMTNkMjMuc3ZnJiMzOTspIG5vLXJlcGVhdDsNCiAgICBiYWNrZ3JvdW5kLXNpemU6IDMwcHggMzBweDsNCiAgfQ0KICAuaW1wb3dlckJveCAuc3RhdHVzX3R4dCBwIHsNCiAgICB0b3A6IDA7DQogICAgZGlzcGxheTogbm9uZTsNCiAgfQ0KICAuaW1wb3dlckJveCAuaWNvbjM4X21zZy5zdWNjIHsNCiAgICBkaXNwbGF5OiBub25lOw0KICB9DQogIC5pbXBvd2VyQm94IC5pY29uMzhfbXNnLndhcm4gew0KICAgIGRpc3BsYXk6IG5vbmU7DQogIH0NCiAgLmltcG93ZXJCb3ggLnN0YXR1cy5zdGF0dXNfYnJvd3NlciB7DQogICAgZGlzcGxheTogYmxvY2sgIWltcG9ydGFudDsNCiAgfQ0KICAvLyAuaW1wb3dlckJveCAuc3RhdHVzLnN0YXR1c19icm93c2VyIHsNCiAgLy8gICBwb3NpdGlvbjogcmVsYXRpdmU7DQogIC8vICAgbWFyZ2luLXRvcDogOS41cHg7DQogIC8vIH0NCiAgLy8gLmltcG93ZXJCb3ggLnN0YXR1cy5zdGF0dXNfYnJvd3NlciBwOm50aC1jaGlsZCgxKSB7DQogIC8vICAgZGlzcGxheTogbm9uZTsNCiAgLy8gfQ0KICAvLyAuaW1wb3dlckJveCAuc3RhdHVzLnN0YXR1c19icm93c2VyIHA6bnRoLWNoaWxkKDEpOjphZnRlcnsNCiAgLy8gICBjb250ZW50OiAmIzM5OyYjMzk7OyANCiAgLy8gICB9DQogIC5pbXBvd2VyQm94IC5zdGF0dXMuc3RhdHVzX2Jyb3dzZXIgcDpudGgtY2hpbGQoMikgew0KICAgIGRpc3BsYXk6IG5vbmU7DQogIH0NCiAgLmltcG93ZXJCb3ggLnN0YXR1cy5zdGF0dXNfYnJvd3Nlcjo6YWZ0ZXIgew0KICAgIGZvbnQtc2l6ZTogMTJweDsNCiAgICBjb2xvcjogIzhGOEY4RjsNCiAgICBjb250ZW50OiAmIzM5OyYjMzk7OyANCiAgfQ0KICAuaW1wb3dlckJveCAuc3RhdHVzX3R4dCBwIHsNCiAgICBmb250LXNpemU6IDEycHggIWltcG9ydGFudDsNCiAgfQ0KICAuaW1wb3dlckJveCAuc3RhdHVzIHAgew0KICAgIGZvbnQtc2l6ZTogMTJweDsNCiAgICBjb2xvcjogIzhGOEY4RjsNCiAgICBsaW5lLWhlaWdodDogMTZweDsNCiAgICBtYXJnaW4tdG9wOiA1cHg7DQogIH0NCg0KICAud2ViX3FyY29kZV9wYW5lbF9xdWlja19sb2dpbiB7DQogICAgbWFyZ2luLXRvcDogMjVweDsNCiAgfQ0KDQogIC5xbG9naW5fdXNlcl9hdmF0YXIgew0KICAgIHdpZHRoOiA4MHB4Ow0KICAgIGhlaWdodDogODBweDsNCiAgfQ0KDQogIC5xbG9naW5fdXNlcl9uaWNrbmFtZSB7DQogICAgY29sb3I6ICMwMDAwMDA7DQogICAgZm9udC1zaXplOiAxNHB4Ow0KICAgIGZvbnQtd2VpZ2h0OiA0MDA7DQogICAgbWFyZ2luLXRvcDogNXB4Ow0KICAgIG1hcmdpbi1ib3R0b206IDEwcHg7DQogICAgbGluZS1oZWlnaHQ6IDIwcHg7DQogIH0NCg0KICAucWxvZ2luX2J0bi5xbG9naW5fYnRuIHsNCiAgICB3aWR0aDogMTQwcHg7DQogICAgaGVpZ2h0OiA0MHB4Ow0KICAgIGZvbnQtc2l6ZTogMTZweDsNCiAgICBsaW5lLWhlaWdodDogMjJweDsNCiAgICBib3JkZXItcmFkaXVzOiA1cHg7DQogIH0NCiAgLndldWktdG9hc3Qgew0KICAgIHRvcDogMjIlOw0KICB9DQoNCi53cnBfY29kZSB7DQogIGhlaWdodDogMTYwcHg7DQp9DQoud2ViX3FyY29kZV9zd2l0Y2hfd3JwIHsNCiAgbWFyZ2luLXRvcDogMzJweDsNCiAgaGVpZ2h0OiAxNnB4Ow0KICBsaW5lLWhlaWdodDogMTZweDsNCiAgZm9udC13ZWlnaHQ6IDQwMDsNCiAgZm9udC1zaXplOiAxMnB4Ow0KfQ0KDQoucWxvZ2luX21vZCAud2ViX3FyY29kZV9zd2l0Y2hfd3JwIHsNCiAgbWFyZ2luLXRvcDogMzJweDsNCn0NCg0KLndlYl9xcmNvZGVfc3dpdGNoIHsNCiAgZm9udC1zaXplOiAxMnB4Ow0KICBjb2xvcjogIzAwMEY3QTsNCn0='
};

const sessions = new Map();

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
  };
  return map[ext] || 'application/octet-stream';
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
    ...extraHeaders,
  });
  res.end(body);
}

function sendText(res, statusCode, body, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...extraHeaders,
  });
  res.end(body);
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  const cookies = {};
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }
    const index = trimmed.indexOf('=');
    if (index === -1) {
      continue;
    }
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1);
    cookies[key] = decodeURIComponent(value);
  }
  return cookies;
}

function getOrCreateSession(req, res) {
  const cookies = parseCookies(req);
  let sid = cookies[COOKIE_NAME];
  let session = sid ? sessions.get(sid) : null;
  if (!session) {
    sid = crypto.randomUUID();
    session = {
      id: sid,
      createdAt: Date.now(),
    };
    sessions.set(sid, session);
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(sid)}; Path=/; HttpOnly; SameSite=Lax`);
  }
  return session;
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) {
    return {};
  }
  return JSON.parse(raw);
}

function flattenCandidates(input, out = []) {
  if (input == null) {
    return out;
  }
  out.push(input);
  if (Array.isArray(input)) {
    for (const item of input) {
      flattenCandidates(item, out);
    }
    return out;
  }
  if (typeof input === 'object') {
    for (const value of Object.values(input)) {
      flattenCandidates(value, out);
    }
  }
  return out;
}

function firstString(...candidates) {
  for (const candidate of flattenCandidates(candidates)) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }
  return '';
}

function firstObject(...candidates) {
  for (const candidate of flattenCandidates(candidates)) {
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
      return candidate;
    }
  }
  return null;
}

function mapUserInfo(rawUserInfo, fallbackGuid) {
  const source = rawUserInfo && typeof rawUserInfo === 'object' ? rawUserInfo : {};
  return {
    nickname:
      firstString(source.nickname, source.nick_name) || '',
    avatar:
      firstString(source.avatar, source.avatar_url, source.head_img_url, source.head_img) || '',
    guid: firstString(source.guid, fallbackGuid) || '',
    userId: firstString(source.userId, source.user_id) || '',
    ...source,
  };
}

function normalizeJprxResponse(raw, response) {
  const nestedCode =
    raw?.data?.resp?.common?.code ??
    raw?.data?.common?.code ??
    raw?.resp?.common?.code ??
    raw?.common?.code;
  const nestedMessage =
    raw?.data?.resp?.common?.message ??
    raw?.data?.common?.message ??
    raw?.resp?.common?.message ??
    raw?.common?.message ??
    raw?.message ??
    response.statusText;

  if (!response.ok) {
    return {
      success: false,
      code: response.status,
      message: nestedMessage || `HTTP ${response.status}`,
      data: raw,
    };
  }

  const ret = raw?.ret;
  const data =
    raw?.data?.resp?.data ??
    raw?.data?.data ??
    raw?.resp?.data ??
    raw?.data ??
    raw;

  if (ret === 0 && (nestedCode == null || nestedCode === 0)) {
    return {
      success: true,
      code: 0,
      message: 'Success',
      data,
      raw,
    };
  }

  return {
    success: false,
    code: nestedCode ?? ret ?? response.status,
    message: nestedMessage || '业务请求失败',
    data,
    raw,
  };
}

async function postJprx(endpoint, payload, session) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Version': '1',
    'X-Token': session.loginKey || '',
    'X-Guid': session.guid || '1',
    'X-Account': session.userId || '1',
    'X-Session': '',
  };
  if (session.jwtToken) {
    headers['X-OpenClaw-Token'] = session.jwtToken;
  }

  const requestBody = {
    ...payload,
    web_version: APP_VERSION,
    web_env: APP_ENV,
  };

  const response = await fetch(`${JPRX_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  const headerJwt = response.headers.get('x-new-token') || response.headers.get('X-New-Token') || '';
  if (headerJwt) {
    session.jwtToken = headerJwt;
  }

  let raw = null;
  try {
    raw = await response.json();
  } catch {
    raw = null;
  }

  return normalizeJprxResponse(raw, response);
}

function applyLoginContext(session, result) {
  const bodyToken = firstString(
    result.data?.token,
    result.raw?.data?.resp?.data?.token,
    result.raw?.data?.data?.token,
    result.raw?.resp?.data?.token
  );

  const rawUserInfo =
    firstObject(
      result.data?.userInfo,
      result.data?.user_info,
      result.raw?.data?.userInfo,
      result.raw?.data?.user_info,
      result.raw?.data?.resp?.data?.userInfo,
      result.raw?.data?.resp?.data?.user_info,
      result.raw?.data?.data?.userInfo,
      result.raw?.data?.data?.user_info,
      result.raw?.resp?.data?.userInfo,
      result.raw?.resp?.data?.user_info
    ) || {};

  const userInfo =
    mapUserInfo(rawUserInfo, session.guid);

  const userId = firstString(
    userInfo.userId,
    userInfo.user_id,
    result.data?.userId,
    result.data?.user_id,
    result.raw?.data?.resp?.data?.userId,
    result.raw?.data?.resp?.data?.user_id
  );

  const guid = firstString(
    userInfo.guid,
    result.data?.guid,
    result.data?.user_guid,
    result.raw?.data?.resp?.data?.guid,
    result.raw?.data?.resp?.data?.user_guid,
    session.guid
  );

  const loginKey = firstString(
    userInfo.loginKey,
    userInfo.login_key,
    result.data?.loginKey,
    result.data?.login_key,
    result.raw?.data?.loginKey,
    result.raw?.data?.login_key,
    result.raw?.data?.resp?.data?.loginKey,
    result.raw?.data?.resp?.data?.login_key
  );

  const openclawChannelToken = firstString(
    result.data?.openclawChannelToken,
    result.data?.openclaw_channel_token,
    result.raw?.data?.resp?.data?.openclawChannelToken,
    result.raw?.data?.resp?.data?.openclaw_channel_token,
    result.raw?.data?.data?.openclawChannelToken,
    result.raw?.data?.data?.openclaw_channel_token
  );

  session.userInfo = userInfo;
  session.userId = userId || session.userId || '';
  session.guid = guid || session.guid || '';
  session.loginKey = loginKey || session.loginKey || '';
  session.jwtToken = bodyToken || session.jwtToken || '';
  session.openclawChannelToken = openclawChannelToken || session.openclawChannelToken || '';
}

async function handleStart(req, res, session) {
  session.guid = crypto.randomUUID();
  session.state = '';
  session.loginKey = '';
  session.userId = '';
  session.userInfo = null;
  session.jwtToken = '';
  session.openclawChannelToken = '';
  session.apiKey = '';

  const result = await postJprx('/data/4050/forward', { guid: session.guid }, session);
  if (!result.success) {
    return sendJson(res, 502, {
      success: false,
      code: result.code,
      message: result.message,
      details: result.data,
    });
  }

  const state = firstString(result.data?.state);
  session.state = state;

  return sendJson(res, 200, {
    success: true,
    appid: WX_LOGIN_INFO.appid,
    redirectUri: WX_LOGIN_INFO.redirectUri,
    wxLoginStyleBase64: WX_LOGIN_INFO.wxLoginStyleBase64,
    guid: session.guid,
    state,
  });
}

async function handleCallback(req, res, session) {
  const body = await readJsonBody(req);
  const code = firstString(body.code);
  if (!code) {
    return sendJson(res, 400, { success: false, message: '缺少 code' });
  }
  if (!session.guid || !session.state) {
    return sendJson(res, 400, { success: false, message: '请先初始化二维码' });
  }

  const result = await postJprx('/data/4026/forward', {
    guid: session.guid,
    state: session.state,
    code,
  }, session);

  if (!result.success) {
    return sendJson(res, 502, {
      success: false,
      code: result.code,
      message: result.message,
      details: result.data,
    });
  }

  applyLoginContext(session, result);

  if ((!session.userInfo || !session.userInfo.userId) && session.guid) {
    const userInfoResult = await postJprx('/data/4027/forward', { guid: session.guid }, session);
    if (userInfoResult.success) {
      applyLoginContext(session, userInfoResult);
    }
  }

  if (!session.openclawChannelToken) {
    const channelTokenResult = await postJprx('/data/4058/forward', {}, session);
    if (channelTokenResult.success) {
      applyLoginContext(session, channelTokenResult);
    }
  }

  return sendJson(res, 200, {
    success: true,
    userInfo: session.userInfo || {},
    userId: session.userId || '',
    guid: session.guid || '',
    hasLoginKey: Boolean(session.loginKey),
    hasJwtToken: Boolean(session.jwtToken),
    openclawChannelToken: session.openclawChannelToken || '',
    debug: {
      bodyHasToken: Boolean(
        firstString(
          result.data?.token,
          result.raw?.data?.resp?.data?.token,
          result.raw?.data?.data?.token,
          result.raw?.resp?.data?.token
        )
      ),
      bodyHasUserInfo: Boolean(
        firstObject(
          result.data?.userInfo,
          result.data?.user_info,
          result.raw?.data?.resp?.data?.userInfo,
          result.raw?.data?.resp?.data?.user_info,
          result.raw?.data?.data?.userInfo,
          result.raw?.data?.data?.user_info
        )
      ),
      bodyHasLoginKey: Boolean(
        firstString(
          result.data?.loginKey,
          result.data?.login_key,
          result.raw?.data?.resp?.data?.loginKey,
          result.raw?.data?.resp?.data?.login_key
        )
      ),
    },
  });
}

async function handleApiKey(_req, res, session) {
  if (!session.guid) {
    return sendJson(res, 400, { success: false, message: '当前会话没有 guid，请重新扫码' });
  }

  const result = await postJprx('/data/4055/forward', {}, session);
  if (!result.success) {
    return sendJson(res, 502, {
      success: false,
      code: result.code,
      message: result.message,
      details: result.data,
      context: {
        hasLoginKey: Boolean(session.loginKey),
        hasJwtToken: Boolean(session.jwtToken),
        userId: session.userId || '',
        guid: session.guid || '',
      },
    });
  }

  const apiKey = firstString(
    result.data?.key,
    result.raw?.data?.key,
    result.raw?.data?.resp?.data?.key,
    result.raw?.resp?.data?.key
  );

  if (!apiKey) {
    return sendJson(res, 502, {
      success: false,
      message: '接口返回成功，但没有拿到 apiKey',
      details: result.data,
    });
  }

  session.apiKey = apiKey;

  return sendJson(res, 200, {
    success: true,
    apiKey,
    userInfo: session.userInfo || {},
    userId: session.userId || '',
    guid: session.guid || '',
  });
}

async function handleStatus(_req, res, session) {
  return sendJson(res, 200, {
    success: true,
    session: {
      guid: session.guid || '',
      state: session.state || '',
      userId: session.userId || '',
      hasLoginKey: Boolean(session.loginKey),
      hasJwtToken: Boolean(session.jwtToken),
      hasApiKey: Boolean(session.apiKey),
    },
  });
}

function serveStatic(req, res) {
  let requestedPath = req.url === '/' ? '/index.html' : req.url;
  requestedPath = requestedPath.split('?')[0];
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    return sendText(res, 403, 'Forbidden');
  }
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        return sendText(res, 404, 'Not Found');
      }
      return sendText(res, 500, 'Internal Server Error');
    }
    res.writeHead(200, {
      'Content-Type': getMimeType(filePath),
      'Cache-Control': 'no-store',
      'Content-Length': content.length,
    });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const session = getOrCreateSession(req, res);
    const pathname = (req.url || '/').split('?')[0];

    if (req.method === 'GET' && pathname === '/api/login/start') {
      return await handleStart(req, res, session);
    }
    if (req.method === 'POST' && pathname === '/api/login/callback') {
      return await handleCallback(req, res, session);
    }
    if (req.method === 'POST' && pathname === '/api/login/apikey') {
      return await handleApiKey(req, res, session);
    }
    if (req.method === 'GET' && pathname === '/api/login/status') {
      return await handleStatus(req, res, session);
    }
    if (req.method === 'GET') {
      return serveStatic(req, res);
    }

    return sendText(res, 405, 'Method Not Allowed');
  } catch (error) {
    return sendJson(res, 500, {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`QClaw QR login web is running at http://${HOST}:${PORT}`);
});
