# 阿里 HTTPDNS 用量面板

在 Surge Panel 中并发查询多个阿里云账号当月的移动解析 HTTPDNS / DoH 用量。

## 安装

模块地址：

```text
https://raw.githubusercontent.com/RoaycL/Surge/main/Module/AliDNSUsage/AliDNS-Usage.sgmodule
```

## 账号参数

`账号列表`格式：

```text
名称|RAM AccessKey ID|RAM AccessKey Secret;名称2|RAM AccessKey ID|RAM AccessKey Secret
```

示例：

```text
主账号|LTAIxxxxxxxx|secretxxxxxxxx;备用账号|LTAIyyyyyyyy|secretyyyyyyyy
```

凭据作为 Surge 模块参数保存在本机。脚本直接对阿里云 RPC OpenAPI 请求签名，不经过第三方中转服务。

## RAM 最小权限

请为每个阿里云主账号单独创建只读 RAM 用户，不要填写主账号高权限 AccessKey。

```json
{
  "Version": "1",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "alidns:DescribeDohAccountStatistics",
      "Resource": "*"
    }
  ]
}
```

这里需要的是 RAM / OpenAPI AccessKey，不是移动解析 HTTPDNS“接入配置”页面生成的客户端接入密钥。

## 统计口径

- 查询周期：本自然月 1 日至当天。
- 默认免费额度：每个账号每月 1000 万次 HTTP 等价流量。
- HTTP 请求按 1 倍计算。
- HTTPS / DoH 请求按 5 倍计算。
- `请求`：API 返回的原始请求总量。
- `折算`：用于额度判断的 HTTP 等价流量。

如果阿里云以后调整额度，可在模块参数中修改`月度额度`。
