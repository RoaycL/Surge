# VMISS 流量接口（vnstat）

给 [VMISS 流量概况](../../Module/Panel/VMISS-Traffic.sgmodule) 面板提供数据。每个使用者把它部署在**自己的** VPS 上，再把地址和密钥填进模块参数。

VMISS 客户中心对所有非浏览器请求都返回 Cloudflare 验证，面板无法直接查询，所以改为在服务器本机用 vnstat 统计。

## 特点

- vnstat 把流量写进 `/var/lib/vnstat/vnstat.db`，服务器重启后接着累计，不会清零。
- 重置日和时区由面板的模块参数决定，服务器不用改：vnstat 按小时记录流量（保留 70 天），每次请求时按面板传来的重置日和时区现算本周期用量。默认每月 23 号 0 点（UTC-5），进出双向都计入。
- 一台服务器可以给不同重置规则的面板同时使用。
- 只暴露一个只读接口 `GET /traffic`，必须带访问密钥，否则返回 401。

## 部署（Ubuntu / Debian，root）

```bash
git clone --depth 1 https://github.com/RoaycL/Surge.git
cd Surge/Service/vmiss-traffic
bash install.sh
```

首次运行会生成 `/etc/vmiss-traffic.env`（权限 600）并随机生成访问密钥。重复运行会保留已有设置。

查看访问密钥：

```bash
grep VMISS_TOKEN /etc/vmiss-traffic.env
```

## 配置 `/etc/vmiss-traffic.env`

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `VMISS_TOKEN` | 随机 | 访问密钥，填进模块的“访问密钥” |
| `VMISS_IFACE` | `eth0` | 统计的网卡 |
| `VMISS_PORT` | `8890` | 接口端口 |
| `VMISS_RESET_DAY` | `23` | 请求未带 `reset_day` 时的默认重置日 |
| `VMISS_UTC_OFFSET` | `-5` | 请求未带 `utc_offset` 时的默认时区 |
| `VMISS_BASE_BYTES` | `0` | 部署前本周期已用的字节数（vnstat 只能统计安装之后的流量） |
| `VMISS_BASE_AT` | 空 | vnstat 开始统计的时间，如 `2026-11-20T03:30:00+00:00`；上一项只计入包含这一刻的周期 |

修改后重新运行 `bash install.sh`（改了网卡时），或只重启接口：

```bash
systemctl restart vmiss-traffic
```

## 模块参数

- 接口地址：`http://<服务器IP>:8890/traffic`
- 访问密钥：`VMISS_TOKEN` 的值
- 总流量：套餐每月流量（GB，按 1024³ 字节计）
- 重置日 / 重置时区：每月几号、哪个时区的 0 点重置，如 `23` / `-5`

如果服务器有防火墙或云厂商安全组，需要放行 `VMISS_PORT`。

## 检查

```bash
. /etc/vmiss-traffic.env
curl -H "X-Token: $VMISS_TOKEN" "http://127.0.0.1:$VMISS_PORT/traffic?reset_day=23&utc_offset=-5"
```

返回示例：

```json
{"used": 12345, "rx": 6000, "tx": 6345, "base": 0, "periodStart": "2026-11-23T00:00:00-05:00", "nextReset": "2026-12-23T00:00:00-05:00", "updated": "2026-11-24T08:00:00+00:00"}
```

## 卸载

```bash
systemctl disable --now vmiss-traffic
rm -rf /etc/systemd/system/vmiss-traffic.service /opt/vmiss-traffic /etc/vmiss-traffic.env
systemctl daemon-reload
```
