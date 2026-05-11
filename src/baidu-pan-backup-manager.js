/**
 * FavsHub 百度网盘云端备份管理器
 * 直接调用百度网盘 REST API，通过 OAuth 2.0 简化模式认证
 *
 * 流程：用户点击"连接" → OAuth 授权 → 获取 access_token → 备份/恢复
 * AppKey 内置在代码中，用户无需输入任何凭据
 */

// ── 应用凭据（百度开放平台注册） ──

const APP_KEY = 'vk589M5xfVxbIjM80JZdxVPG2ye6ok6u';
const RELAY_URL = 'https://huanyu-a.github.io/FavsHub/src/oauth-callback.html';
const REMOTE_DIR = '/apps/FavsHub';

// ── 轻量 MD5 实现（用于百度 API block_list 参数） ──

function md5(string) {
  function md5cycle(x, k) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189);
    a = ii(a, b, c, d, k[9], 4, -640364487); d = ii(d, a, b, c, k[12], 11, -421815835);
    c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]); x[1] = add32(b, x[1]); x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
  }
  function cmn(q, a, b, x, s, t) { a = add32(add32(a, q), add32(x, t)); return add32((a << s) | (a >>> (32 - s)), b); }
  function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
  function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
  function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
  function md5blk(s) {
    const md5blks = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }
  function add32(a, b) { return (a + b) & 0xFFFFFFFF; }
  function rhex(n) {
    const s = '0123456789abcdef';
    let j = '';
    for (let i = 0; i < 4; i++) j += s.charAt((n >> (i * 8 + 4)) & 0x0F) + s.charAt((n >> (i * 8)) & 0x0F);
    return j;
  }

  let n = string.length;
  let state = [1732584193, -271733879, -1732584194, 271733878];
  let i;
  for (i = 64; i <= n; i += 64) md5cycle(state, md5blk(string.substring(i - 64, i)));
  string = string.substring(i - 64);
  const tail = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  for (i = 0; i < string.length; i++) tail[i >> 2] |= string.charCodeAt(i) << ((i % 4) << 3);
  tail[i >> 2] |= 0x80 << ((i % 4) << 3);
  if (i > 55) { md5cycle(state, tail); tail.fill(0); }
  tail[14] = n * 8;
  md5cycle(state, tail);
  return rhex(state[0]) + rhex(state[1]) + rhex(state[2]) + rhex(state[3]);
}

function md5hex(data) {
  if (typeof data === 'string') return md5(data);
  let s = '';
  for (let i = 0; i < data.length; i++) s += String.fromCharCode(data[i]);
  return md5(s);
}

// ── 主类 ──

class BaiduPanBackupManager {
  static STORAGE_KEY = 'baiduPanConfig';
  static HISTORY_KEY = 'baiduPanBackupHistory';
  static AUTO_KEY = 'baiduPanAutoBackup';

  // ── 配置读写 ──

  async getConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.get([BaiduPanBackupManager.STORAGE_KEY], (r) => {
        resolve(r[BaiduPanBackupManager.STORAGE_KEY] || {});
      });
    });
  }

  async setConfig(partial) {
    const current = await this.getConfig();
    const merged = { ...current, ...partial };
    return new Promise((resolve) => {
      chrome.storage.local.set({ [BaiduPanBackupManager.STORAGE_KEY]: merged }, resolve);
    });
  }

  async clearConfig() {
    return new Promise((resolve) => {
      chrome.storage.local.remove(BaiduPanBackupManager.STORAGE_KEY, resolve);
    });
  }

  // ── 连接状态 ──

  async isConnected() {
    const cfg = await this.getConfig();
    return !!(cfg.accessToken && cfg.expiresAt);
  }

  // ── OAuth 流程（简化模式） ──

  _isExtensionUnpacked() {
    return chrome.runtime.id.length !== 32; // Unpacked extensions have human-readable IDs
  }

  _getRedirectUri() {
    if (chrome.identity?.getRedirectURL) {
      return chrome.identity.getRedirectURL();
    }
    // 如果没有chrome.identity权限，则直接返回基于runtime.id的URL
    return `https://${chrome.runtime.id}.chromiumapp.org/`;
  }

  async startOAuth() {
    // 每次都强制执行完整的OAuth流程，而不是检查现有连接状态
    // 先清除现有认证信息以确保弹出授权窗口
    await this.clearConfig();

    // 检查是否具有必要的权限
    if (chrome.identity) {
      console.log('[BaiduPan] Chrome Identity API is available');
    } else {
      console.warn('[BaiduPan] Chrome Identity API is not available, falling back to popup');
    }

    // Check if we're running an unpacked extension and log appropriately
    if (this._isExtensionUnpacked()) {
      console.log('[BaiduPan] Extension is running unpacked, may affect OAuth flow');
    }

    // 中继页面地址（GitHub Pages），授权后百度会重定向到此页面
    const extId = chrome.runtime.id;
    const redirectUri = RELAY_URL + '?ext_id=' + encodeURIComponent(extId);
    const authUrl = new URL('https://openapi.baidu.com/oauth/2.0/authorize');
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('client_id', APP_KEY);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'basic,netdisk');
    authUrl.searchParams.set('display', 'popup');
    // 不再使用force_login，而是让OAuth流程检测浏览器登录状态
    // authUrl.searchParams.set('force_login', '1');
    // authUrl.searchParams.set('confirm_login', '1');
    // 使用approval_prompt=force确保授权提示，但不强制登录
    authUrl.searchParams.set('approval_prompt', 'force');

    let responseUrl;

    // 直接使用弹窗方式以确保用户能看到授权界面
    // 即使有chrome.identity API，我们也优先使用弹窗方式以确保可见的授权体验
    console.log('[BaiduPan] Using popup method to ensure visible authorization window');
    responseUrl = await this._oauthViaPopup(authUrl.toString(), redirectUri);

    // 中继页面将 token 以 query params 形式传回 chromiumapp.org
    let url;
    try {
      url = new URL(responseUrl);
    } catch (err) {
      console.error('[BaiduPan] Failed to parse OAuth response URL:', responseUrl, err);
      throw new Error('AUTH_FAILED: Invalid response URL');
    }

    const accessToken = url.searchParams.get('access_token');
    const expiresIn = parseInt(url.searchParams.get('expires_in'), 10);

    if (!accessToken) {
      console.error('[BaiduPan] No access_token found in response URL:', url.toString());
      console.error('[BaiduPan] Available search params:', Array.from(url.searchParams.keys()));
      throw new Error('AUTH_FAILED: No access token received');
    }

    await this.setConfig({
      accessToken,
      expiresAt: Date.now() + (expiresIn || 2592000) * 1000
    });

    console.log('[BaiduPan] Successfully obtained access token, expires at:', new Date(Date.now() + (expiresIn || 2592000) * 1000));
  }

  _oauthViaPopup(authUrl, redirectUri) {
    return new Promise((resolve, reject) => {
      console.log('[BaiduPan] Opening OAuth popup with URL:', authUrl);

      let popup;
      let settled = false;
      let timer;

      const cleanup = () => {
        if (timer) clearInterval(timer);
        window.removeEventListener('message', onMessage);
        if (timeoutId) clearTimeout(timeoutId);
      };

      const finish = (result) => {
        if (settled) return;
        settled = true;
        cleanup();
        setTimeout(() => {
          try { if (popup && !popup.closed) popup.close(); } catch {}
        }, 1500);
        resolve(result);
      };

      const fail = (err) => {
        if (settled) return;
        settled = true;
        cleanup();
        try { if (popup && !popup.closed) popup.close(); } catch {}
        reject(err);
      };

      // 通过 postMessage 接收 oauth-callback.html 传回的 token
      const onMessage = (event) => {
        if (event.data && event.data.type === 'baidu-oauth-callback') {
          console.log('[BaiduPan] Received token via postMessage');
          const token = event.data.access_token;
          const expiresIn = event.data.expires_in;
          if (token) {
            // 构造一个等效的响应 URL 供后续解析
            const fakeUrl = 'https://localhost/?access_token=' + encodeURIComponent(token)
              + '&expires_in=' + encodeURIComponent(expiresIn || '2592000');
            finish(fakeUrl);
          }
        }
      };
      window.addEventListener('message', onMessage);

      try {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const width = 600;
        const height = 700;
        const left = (screenWidth - width) / 2;
        const top = (screenHeight - height) / 2;
        const popupFeatures = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`;
        popup = window.open(authUrl, 'baidu-oauth', popupFeatures);

        if (!popup) {
          fail(new Error('AUTH_FAILED: Could not open authorization window, check popup blocker'));
          return;
        }
        popup.focus();
      } catch (err) {
        console.error('[BaiduPan] Error opening OAuth popup:', err);
        fail(new Error('AUTH_FAILED: Error opening authorization window'));
        return;
      }

      // 后备轮询：检测弹窗关闭、URL fragment、localStorage
      timer = setInterval(() => {
        try {
          if (popup.closed) {
            fail(new Error('AUTH_FAILED: User closed the authorization window'));
            return;
          }

          // 优先检查 localStorage（oauth-callback.html 写入）
          try {
            const stored = localStorage.getItem('baidu_pan_oauth_result');
            if (stored) {
              const data = JSON.parse(stored);
              localStorage.removeItem('baidu_pan_oauth_result');
              if (data.access_token && (Date.now() - data.timestamp < 60000)) {
                console.log('[BaiduPan] Received token via localStorage');
                const fakeUrl = 'https://localhost/?access_token=' + encodeURIComponent(data.access_token)
                  + '&expires_in=' + encodeURIComponent(data.expires_in || '2592000');
                finish(fakeUrl);
                return;
              }
            }
          } catch {}

          // 尝试读取同源弹窗的 URL（postMessage 可能还未触发）
          try {
            const currentUrl = popup.location.href;
            if (currentUrl.includes('access_token=')) {
              console.log('[BaiduPan] Detected access_token in popup URL');
              finish(currentUrl);
            }
          } catch {}
        } catch {}
      }, 1000);

      // 5分钟超时
      const timeoutId = setTimeout(() => {
        fail(new Error('AUTH_FAILED: Authorization timed out'));
      }, 300000);
    });
  }

  async getValidToken() {
    const cfg = await this.getConfig();
    if (!cfg.accessToken) throw new Error('NO_CREDENTIALS');

    if (Date.now() >= cfg.expiresAt - 300000) {
      throw new Error('TOKEN_EXPIRED');
    }

    return cfg.accessToken;
  }

  async disconnect() {
    await this.clearConfig();
    console.log('[BaiduPan] Disconnected and cleared stored credentials');
  }

  // Added a method to force refresh the token
  async refreshConnection() {
    // Disconnect first
    await this.disconnect();
    // Then initiate a new OAuth flow
    await this.startOAuth();
  }

  // ── 百度网盘 API ──

  async precreate(remotePath, size, blockMd5) {
    const token = await this.getValidToken();
    const url = `https://pan.baidu.com/rest/2.0/xpan/file?method=precreate&access_token=${token}`;
    const body = {
      path: remotePath,
      size: String(size),
      isdir: '0',
      autoinit: '1',
      rtype: '3',
      block_list: JSON.stringify([blockMd5]),
      'content-md5': blockMd5
    };
    console.log('[BaiduPan] precreate request:', { url, body });
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body).toString()
    });
    const data = await resp.json();
    console.log('[BaiduPan] precreate response:', data);
    if (data.errno && data.errno !== 0) {
      const err = new Error('API_ERROR');
      err.errno = data.errno;
      throw err;
    }
    return data;
  }

  async locateUploadDomain(remotePath, uploadid) {
    const token = await this.getValidToken();
    const url = `https://d.pcs.baidu.com/rest/2.0/pcs/file?method=locateupload&appid=250528&access_token=${token}&path=${encodeURIComponent(remotePath)}&uploadid=${encodeURIComponent(uploadid)}&upload_version=2.0`;
    console.log('[BaiduPan] locateUploadDomain request:', url);
    const resp = await fetch(url);
    const data = await resp.json();
    console.log('[BaiduPan] locateUploadDomain response:', data);
    if (data.error_code && data.error_code !== 0) {
      const err = new Error('API_ERROR');
      err.errno = data.error_code;
      throw err;
    }
    const servers = data.servers || [];
    const httpsServer = servers.find(s => s.server.startsWith('https://'));
    const domain = httpsServer ? httpsServer.server : 'https://d.pcs.baidu.com';
    console.log('[BaiduPan] upload domain:', domain);
    return domain;
  }

  async uploadBlock(remotePath, uploadid, blob) {
    const token = await this.getValidToken();
    const uploadDomain = await this.locateUploadDomain(remotePath, uploadid);
    const url = `${uploadDomain}/rest/2.0/pcs/superfile2?method=upload&access_token=${token}&path=${encodeURIComponent(remotePath)}&type=tmpfile&uploadid=${uploadid}&partseq=0`;
    console.log('[BaiduPan] upload request:', url, 'size:', blob.size);
    const formData = new FormData();
    formData.append('file', blob, 'backup.json');
    const resp = await fetch(url, { method: 'POST', body: formData });
    const data = await resp.json();
    console.log('[BaiduPan] upload response:', data);
    if (data.errno && data.errno !== 0) {
      const err = new Error('API_ERROR');
      err.errno = data.errno;
      throw err;
    }
    return data;
  }

  async createFile(remotePath, size, uploadid, blockMd5) {
    const token = await this.getValidToken();
    const url = `https://pan.baidu.com/rest/2.0/xpan/file?method=create&access_token=${token}`;
    const body = {
      path: remotePath,
      size: String(size),
      isdir: '0',
      rtype: '3',
      uploadid,
      block_list: JSON.stringify([blockMd5]),
      'content-md5': blockMd5
    };
    console.log('[BaiduPan] createFile request:', { url, body });
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body).toString()
    });
    const data = await resp.json();
    console.log('[BaiduPan] createFile response:', data);
    if (data.errno && data.errno !== 0) {
      const err = new Error('API_ERROR');
      err.errno = data.errno;
      throw err;
    }
    return data;
  }

  async listFiles(dir) {
    if (!dir) dir = REMOTE_DIR;
    const token = await this.getValidToken();
    const url = `https://pan.baidu.com/rest/2.0/xpan/file/list?dir=${encodeURIComponent(dir)}&order=time&desc=1&access_token=${token}`;
    const resp = await fetch(url);
    return await resp.json();
  }

  async getFileDlink(fsId) {
    const token = await this.getValidToken();
    const url = `https://pan.baidu.com/rest/2.0/xpan/multimedia?method=filemetas&access_token=${token}&fsids=[${fsId}]&dlink=1`;
    console.log('[BaiduPan] getFileDlink request:', url);
    const resp = await fetch(url);
    const data = await resp.json();
    console.log('[BaiduPan] getFileDlink response:', data);
    if (data.errno && data.errno !== 0) {
      const err = new Error('API_ERROR');
      err.errno = data.errno;
      throw err;
    }
    const list = data.list || [];
    if (list.length === 0 || !list[0].dlink) {
      throw new Error('NO_DLINK');
    }
    return list[0].dlink;
  }

  async downloadFile(fsId) {
    const token = await this.getValidToken();
    // 第一步：获取 dlink 下载地址
    const dlink = await this.getFileDlink(fsId);
    // 第二步：用 dlink + access_token 下载，必须带 User-Agent: pan.baidu.com
    const url = `${dlink}&access_token=${token}`;
    console.log('[BaiduPan] download request:', url.substring(0, 100) + '...');
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'pan.baidu.com' }
    });
    if (!resp.ok) throw new Error('NETWORK_ERROR');
    return await resp.text();
  }

  // ── 工具方法 ──

  _hashData(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return hash.toString(36);
  }

  _getTimestampCN() {
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const cnMs = utcMs + 8 * 3600000;
    const cn = new Date(cnMs);
    const y = cn.getFullYear();
    const m = String(cn.getMonth() + 1).padStart(2, '0');
    const d = String(cn.getDate()).padStart(2, '0');
    const hh = String(cn.getHours()).padStart(2, '0');
    const mm = String(cn.getMinutes()).padStart(2, '0');
    const ss = String(cn.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${d}-${hh}${mm}${ss}`;
  }

  // ── 备份操作 ──

  async performBackup(force = false) {
    if (!(await this.isConnected())) throw new Error('NO_CREDENTIALS');
    await this.getValidToken();

    if (!PromptProDB.db) await PromptProDB.init();
    const data = await PromptProDB.exportData();

    const json = JSON.stringify(data);
    const currentHash = this._hashData(json);
    if (!force) {
      const records = await this.getBackupHistory();
      const lastHash = records.length > 0 ? records[0].hash : null;
      if (lastHash && currentHash === lastHash) {
        throw new Error('NO_CHANGE');
      }
    }

    const backup = { version: '1.0', timestamp: new Date().toISOString(), type: 'promptpro', data };
    const backupStr = JSON.stringify(backup, null, 2);
    const filename = `favshub-backup-${this._getTimestampCN()}.json`;
    const remotePath = `${REMOTE_DIR}/${filename}`;

    let contentMd5 = md5hex(backupStr);
    const blob = new Blob([backupStr], { type: 'application/json' });
    const size = blob.size;

    const precreateResult = await this.precreate(remotePath, size, contentMd5);
    const uploadid = precreateResult.uploadid;

    if (precreateResult.return_type !== 2) {
      // 需要分片上传
      const uploadResult = await this.uploadBlock(remotePath, uploadid, blob);
      // 用 upload 返回的 MD5 作为 block_list，确保一致性
      contentMd5 = uploadResult.md5 || contentMd5;
    }

    // 无论秒传还是分片上传，都需要调用 create 获取 fs_id
    const createResult = await this.createFile(remotePath, size, uploadid, contentMd5);

    await this.addBackupRecord({
      filename, fsId: createResult.fs_id || 0,
      timestamp: Date.now(), size, hash: currentHash
    });

    return filename;
  }

  async checkAndAutoBackup() {
    try {
      const enabled = await this.getAutoBackupEnabled();
      if (!enabled) return null;
      if (!(await this.isConnected())) return null;

      try { await this.getValidToken(); } catch { return null; }

      const records = await this.getBackupHistory();
      const lastTime = records.length > 0 ? records[0].timestamp : null;
      const now = Date.now();
      if (lastTime && (now - lastTime) < 24 * 60 * 60 * 1000) return null;

      return await this.performBackup();
    } catch (err) {
      console.warn('[BaiduPan] 自动备份:', err.message);
      return null;
    }
  }

  // ── 备份记录管理 ──

  async getBackupHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.get([BaiduPanBackupManager.HISTORY_KEY], (r) => {
        resolve(r[BaiduPanBackupManager.HISTORY_KEY] || []);
      });
    });
  }

  async addBackupRecord(record) {
    const records = await this.getBackupHistory();
    records.unshift({
      filename: record.filename,
      fsId: record.fsId,
      timestamp: record.timestamp || Date.now(),
      timeFormatted: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      size: record.size,
      hash: record.hash
    });
    if (records.length > 20) records.length = 20;
    return new Promise((resolve) => {
      chrome.storage.local.set({ [BaiduPanBackupManager.HISTORY_KEY]: records }, () => resolve(records));
    });
  }

  async deleteBackupRecord(index) {
    const records = await this.getBackupHistory();
    if (index < 0 || index >= records.length) return records;
    records.splice(index, 1);
    return new Promise((resolve) => {
      chrome.storage.local.set({ [BaiduPanBackupManager.HISTORY_KEY]: records }, () => resolve(records));
    });
  }

  async getLastBackupTimeFormatted() {
    const records = await this.getBackupHistory();
    if (records.length === 0) return null;
    return records[0].timeFormatted;
  }

  // ── 自动备份开关 ──

  async getAutoBackupEnabled() {
    return new Promise((resolve) => {
      chrome.storage.local.get([BaiduPanBackupManager.AUTO_KEY], (r) => {
        resolve(r[BaiduPanBackupManager.AUTO_KEY] === true);
      });
    });
  }

  async setAutoBackupEnabled(enabled) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [BaiduPanBackupManager.AUTO_KEY]: enabled }, resolve);
    });
  }
}

export const baiduPanBackupManager = new BaiduPanBackupManager();
