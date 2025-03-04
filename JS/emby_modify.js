const headers = $request.headers;
let body = $request.body;

// 创建键名映射表 (保留原始大小写格式)
const keyMap = new Map();
Object.keys(headers).forEach(k => keyMap.set(k.toLowerCase(), k));

/* 阶段1: 处理授权头 */
const processAuthHeader = () => {
    const authKey = keyMap.get('x-emby-authorization');
    if (authKey && headers[authKey]) {
        let authValue = headers[authKey];
        
        authValue = authValue
            .replace(/(Client=)"[^"]*"/gi, '$1"SenPlayer"')
            .replace(/(Version=)"[^"]*"/gi, '$1"5.1.6"')
            .replace(/(DeviceId=)"[^"]*"/gi, '$1"4E216DD1-8441-443F-B952-DEDD35B49578"')
            .replace(/Forward/gi, 'SenPlayer'); // 新增全局替换

        headers[authKey] = authValue;
    }
};

/* 阶段2: 彻底清理 User-Agent */
const cleanUserAgent = () => {
    // 删除所有变体
    Array.from(keyMap.keys())
        .filter(lowerKey => lowerKey === 'user-agent')
        .forEach(lowerKey => delete headers[keyMap.get(lowerKey)]);
    
    // 设置统一 UA
    headers['User-Agent'] = 'SenPlayer/5.1.6';
};

/* 阶段3: 全局头部 Forward 替换 */
const replaceHeaders = () => {
    Object.keys(headers).forEach(key => {
        if (typeof headers[key] === 'string') {
            headers[key] = headers[key].replace(/Forward/gi, 'SenPlayer');
        }
    });
};

/* 阶段4: 安全处理请求体 */
const processBody = () => {
    if (!body) return;

    const contentType = (headers[keyMap.get('content-type')] || '').toLowerCase();
    const textTypes = [
        'text/plain',
        'application/json',
        'application/xml',
        'application/x-www-form-urlencoded'
    ];

    if (textTypes.some(t => contentType.includes(t))) {
        try {
            // Base64 安全解码
            const decoded = decodeURIComponent(escape(atob(body)));
            const modified = decoded.replace(/Forward/gi, 'SenPlayer');
            
            // 重新编码
            body = btoa(unescape(encodeURIComponent(modified)));
        } catch (e) {
            console.log(`⚠️ 请求体处理失败: ${e.message}`);
        }
    }
};

// 执行处理流程
processAuthHeader();
cleanUserAgent();
replaceHeaders();
processBody();

$done({ headers, body });
