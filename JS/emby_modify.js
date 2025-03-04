const headers = $request.headers;
let body = $request.body;

// 统一头部键名为小写，便于处理
const lowerHeaders = {};
Object.keys(headers).forEach(key => {
    lowerHeaders[key.toLowerCase()] = headers[key];
});

/* 阶段1: 处理授权头 */
if (lowerHeaders['x-emby-authorization']) {
    const authKey = Object.keys(headers).find(k => k.toLowerCase() === 'x-emby-authorization');
    let authValue = headers[authKey];
    
    authValue = authValue
        .replace(/(Client=)"[^"]*"/gi, '$1"SenPlayer"')
        .replace(/(Version=)"[^"]*"/gi, '$1"5.1.6"')
        .replace(/(DeviceId=)"[^"]*"/gi, '$1"4E216DD1-8441-443F-B952-DEDD35B49578"');
    
    headers[authKey] = authValue;
}

/* 阶段2: 强制统一 User-Agent */
delete headers['User-Agent']; // 删除所有变种写法
headers['User-Agent'] = 'SenPlayer/5.1.6';

/* 阶段3: 全局替换请求头中的 Forward */
Object.keys(headers).forEach(key => {
    headers[key] = headers[key].replace(/Forward/gi, 'SenPlayer');
});

/* 阶段4: 安全替换文本类请求体 */
const contentType = (lowerHeaders['content-type'] || '').toLowerCase();
const isTextType = /^(text\/|application\/(json|xml|x-www-form-urlencoded))/.test(contentType);

if (body && isTextType) {
    try {
        // Base64 解码并替换
        const decodedBody = decodeURIComponent(escape(atob(body)));
        const modifiedBody = decodedBody.replace(/Forward/gi, 'SenPlayer');
        
        // 重新编码并更新 body
        body = btoa(unescape(encodeURIComponent(modifiedBody)));
    } catch (e) {
        console.log(`⚠️ 请求体处理失败: ${e}`);
    }
}

$done({ headers, body });
