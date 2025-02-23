const headers = $request.headers;

// 阶段1：处理X-Emby-Authorization
const lowerHeaders = {};
Object.keys(headers).forEach(key => {
    lowerHeaders[key.toLowerCase()] = headers[key];
});

if (lowerHeaders['x-emby-authorization']) {
    let authHeader = lowerHeaders['x-emby-authorization'];
    authHeader = authHeader
        .replace(/(Client=)"[^"]*"/gi, '$1"SenPlayer"')
        .replace(/(Version=)"[^"]*"/gi, '$1"5.1.6"')
        .replace(/(DeviceId=)"[^"]*"/gi, '$1"4E216DD1-8441-443F-B952-DEDD35B49578"');

    // 保持原始键名格式
    const originalKey = Object.keys(headers).find(k => k.toLowerCase() === 'x-emby-authorization');
    headers[originalKey || 'X-Emby-Authorization'] = authHeader;
}

// 阶段2：强制统一User-Agent
Object.keys(headers)
    .filter(k => k.toLowerCase() === 'user-agent')
    .forEach(k => delete headers[k]);
headers['User-Agent'] = 'SenPlayer/5.1.6';

$done({headers});