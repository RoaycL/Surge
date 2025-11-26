/**
 * 脚本名称: Topology Rename (入口落地检测与重命名)
 * 作用: 检测节点的入口(Entry)和出口(Land)，并按指定格式重命名。
 * 格式: 🅲入口地区→🇸🇬落地地区 01
 * * 使用方法:
 * 在 Sub-Store 中添加 "脚本 (Script)" 操作
 * URL: 指向此脚本
 * Proto: http (推荐) 或 local
 * Timeout: 建议设置长一点，如 10000 (10s)，因为需要进行网络请求
 */

// ================== 1. 字典定义 (保留你习惯的命名) ==================

// 简写代码 -> 中文名称映射
const countryMap = {
  // 常用地区
  'HK': '香港', 'CN': '中国', 'TW': '台湾', 'JP': '日本', 'KR': '韩国', 'SG': '新加坡', 'US': '美国', 'UK': '英国', 'GB': '英国',
  'FR': '法国', 'DE': '德国', 'AU': '澳大利亚', 'CA': '加拿大', 'RU': '俄罗斯', 'IN': '印度', 'TH': '泰国', 'VN': '越南', 'PH': '菲律宾',
  'MY': '马来西亚', 'ID': '印尼', 'TR': '土耳其', 'MO': '澳门',
  // 其他你脚本中的补充
  'AE': '阿联酋', 'AR': '阿根廷', 'BR': '巴西', 'CH': '瑞士', 'IT': '意大利', 'NL': '荷兰', 'ZA': '南非'
};

// 简写代码 -> 国旗映射
const flagMap = {
  'HK': '🇭🇰', 'CN': '🇨🇳', 'TW': '🇹🇼', 'JP': '🇯🇵', 'KR': '🇰🇷', 'SG': '🇸🇬', 'US': '🇺🇸', 'UK': '🇬🇧', 'GB': '🇬🇧',
  'FR': '🇫🇷', 'DE': '🇩🇪', 'AU': '🇦🇺', 'CA': '🇨🇦', 'RU': '🇷🇺', 'IN': '🇮🇳', 'TH': '🇹🇭', 'VN': '🇻🇳', 'PH': '🇵🇭',
  'MY': '🇲🇾', 'ID': '🇮🇩', 'TR': '🇹🇷', 'MO': '🇲🇴',
  'AE': '🇦🇪', 'AR': '🇦🇷', 'BR': '🇧🇷', 'CH': '🇨🇭', 'IT': '🇮🇹', 'NL': '🇳🇱', 'ZA': '🇿🇦'
};

// 备用：如果未匹配到，直接显示代码
const getCountryName = (code) => countryMap[code] || code;
const getFlag = (code) => flagMap[code] || '';

// ================== 2. 核心逻辑：produce 函数 ==================

async function produce(proxies) {
  // 限制并发数，避免瞬间请求过多导致报错或卡死
  const concurrency = 10; 
  const results = [];
  
  // 辅助函数：分批处理
  const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
  
  const batches = chunk(proxies, concurrency);
  
  // 用于序号计数： { "🅲香港→🇸🇬新加坡": 1, ... }
  const nameCounter = {};

  for (const batch of batches) {
    const batchResults = await Promise.all(batch.map(async (proxy) => {
      try {
        // --- A. 获取落地 (Landing) 信息 ---
        // 使用该节点访问 ip-api 获取出口信息
        // 这里的 URL 使用 http，避免部分节点不支持 https 握手导致检测失败
        const landInfo = await httpAPI('http://ip-api.com/json?fields=status,countryCode', proxy);
        const landCode = (landInfo && landInfo.status === 'success') ? landInfo.countryCode : 'UNK';
        
        // --- B. 获取入口 (Entry) 信息 ---
        // 解析节点配置中的 server (域名或IP) 的归属地
        // 注意：直连节点入口即本地，中转节点入口为中转机
        let entryCode = 'UNK';
        if (proxy.server) {
            // 直接请求 api 查询 server 对应的 IP 信息 (直连查询，不走代理)
            const entryInfo = await httpAPI(`http://ip-api.com/json/${proxy.server}?fields=status,countryCode`);
            entryCode = (entryInfo && entryInfo.status === 'success') ? entryInfo.countryCode : 'UNK';
        }

        // --- C. 构建新名称 ---
        // 格式：🅲入口地区→🇸🇬落地地区
        const entryName = getCountryName(entryCode);
        const landFlag = getFlag(landCode);
        const landName = getCountryName(landCode);

        // 如果检测失败或为未知，保留原名或标记
        if (landCode === 'UNK') {
           return proxy; // 检测失败不改名，或者你可以改为 return { ...proxy, name: `[检测失败] ${proxy.name}` };
        }

        // 基础名称模板
        const baseName = `🅲${entryName}→${landFlag}${landName}`;
        
        return {
          ...proxy,
          _baseName: baseName // 暂存基础名，用于后续排序和编号
        };

      } catch (e) {
        // 发生错误（如超时），返回原节点
        return proxy;
      }
    }));
    results.push(...batchResults);
  }

  // ================== 3. 排序与生成序号 (01, 02) ==================
  
  // 清理结果，准备最终输出
  const finalProxies = results.map(p => {
    if (!p._baseName) return p; // 没有 _baseName 的说明没改名

    // 初始化计数器
    if (!nameCounter[p._baseName]) {
      nameCounter[p._baseName] = 0;
    }
    
    // 计数 +1
    nameCounter[p._baseName]++;
    
    // 生成序号，如 01, 02
    const seq = nameCounter[p._baseName].toString().padStart(2, '0');
    
    // 组合最终名称
    const newName = `${p._baseName} ${seq}`;
    
    // 删除临时属性，返回新节点对象
    const { _baseName, ...rest } = p;
    return { ...rest, name: newName };
  });

  return finalProxies;
}

// ================== 4. HTTP 请求封装 ==================

function httpAPI(url, proxy = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      url: url,
      timeout: 5000, // 5秒超时
      headers: { 'User-Agent': 'SubStore-Node-Checker' }
    };
    
    // 如果传入了 proxy 参数，说明要通过该代理访问 (检测出口)
    if (proxy) {
      opts.node = proxy; 
    }

    $http.get(opts).then(resp => {
      try {
        if (resp.statusCode === 200) {
          resolve(JSON.parse(resp.body));
        } else {
          resolve(null);
        }
      } catch (e) {
        resolve(null);
      }
    }, err => {
      resolve(null); // 网络错误返回 null
    });
  });
}
