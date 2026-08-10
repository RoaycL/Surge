# 阿里 HTTPDNS 用量面板

在 Surge Panel 中并发查询多个阿里云账号当月的移动解析 HTTPDNS / DoH 用量。

## 安装

模块地址：

```text
https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AliDNSUsage/AliDNS-Usage.sgmodule
```

## 账号参数

模块提供 5 组独立账号输入栏，每个账号分别填写：

```text
账号名称
AccessKey ID
AccessKey Secret
```

账号名称同时作为启用开关：

- 填写名称并同时填写 ID、Secret：启用该账号。
- 名称填写 `#` 或留空：忽略该账号。
- 最多支持 5 个不同阿里云主账号。

凭据作为 Surge 模块参数保存在本机。脚本直接对阿里云 RPC OpenAPI 请求签名，不经过第三方中转服务。

## RAM 最小权限

请为每个阿里云主账号单独创建只读 RAM 用户，不要填写主账号高权限 AccessKey。

```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "pubdns:DescribePdnsRequestStatistic",
      "Resource": "*"
    }
  ]
}
```

这里需要的是 RAM / OpenAPI AccessKey，不是移动解析 HTTPDNS“接入配置”页面生成的客户端接入密钥。

## 统计口径

- 查询周期：本自然月 1 日至当天。
- 默认免费额度：每个账号每月 1000 万次 HTTP 等价流量。
- 使用 `DescribePdnsRequestStatistic` 的账号维度统计，与公共DNS控制台的计费口径一致。
- `HttpCount`（HTTP解析量）按 1 倍计算。
- `HttpsCount`（HTTPS解析量，包含 DoH）按 5 倍计算。
- 第一行：`账号名称：已用 HTTP 等价量 / 月度套餐容量`。
- 第二行：`HTTP解析量：数值    丨    HTTPS解析量：数值`，使用制表位将分隔符稳定放在中间。
- 每个账号之间保留一个空行，方便区分多账号数据。
- 账号名称如果是中国大陆手机号（11位、以1开头），自动脱敏为 `138****1234`。

如果阿里云以后调整额度，可在模块参数中修改`月度额度`。
