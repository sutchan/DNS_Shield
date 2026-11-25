// src/utils/scriptGenerator.ts v3.22.0
// 路由器与 DNS 守护进程一键同步脚本生成器：
// 支持针对 AsusWRT-Merlin / OpenWrt / SmartDNS / Pi-hole 生成自动拉取、备份与重启的 Shell 脚本。
// v3.22.0：移除 curl -k / wget --no-check-certificate 降级（T-AUD-H03），脚本以 root 覆盖
// dnsmasq 配置，必须校验服务端证书；OpenWrt 需预装 ca-bundle 才能拉取 HTTPS 规则源。

export type RouterScriptTarget = 'openwrt' | 'merlin' | 'padavan' | 'smartdns' | 'pihole';

export interface ScriptOptions {
  ruleUrl: string;
  target: RouterScriptTarget;
}

// 将字符串安全嵌入单引号 shell 字面量：单引号经 '\'' 转义，
// 双引号 / $() / 反引号 / 反斜杠在单引号内均为字面量，可彻底阻断命令注入（T-P3-04）。
const shellQuote = (value: string): string => "'" + value.replace(/'/g, "'\\''") + "'";

/**
 * 根据目标路由器系统生成全自动 Shell 更新同步脚本
 * @param options 生成配置
 * @returns 可执行 Shell 脚本内容
 */
export function generateRouterScript(options: ScriptOptions): string {
  const { ruleUrl, target } = options;
  const safeUrl = ruleUrl.trim() || 'https://raw.githubusercontent.com/sutchan/DNS_Shield/main/public/dnsmasq.conf';

  switch (target) {
    case 'openwrt':
      return `#!/bin/sh
# DNS Shield Auto-Sync Script for OpenWrt
# 放置路径: /etc/dns_shield_update.sh
# 添加定时任务: echo "0 4 * * * /etc/dns_shield_update.sh >/dev/null 2>&1" >> /etc/crontabs/root

CONF_DIR="/etc/dnsmasq.d"
CONF_FILE="$CONF_DIR/dns-shield.conf"
TMP_FILE="/tmp/dns-shield.conf.tmp"
URL=${shellQuote(safeUrl)}

mkdir -p "$CONF_DIR"

echo "[DNS Shield] Downloading latest rules from $URL ..."
# 证书校验强制开启（T-AUD-H03）：OpenWrt 需安装 ca-bundle，否则 HTTPS 拉取失败并保留旧配置
if which curl >/dev/null 2>&1; then
  curl -fsS -m 30 -o "$TMP_FILE" "$URL"
elif which wget >/dev/null 2>&1; then
  wget -q -T 30 -O "$TMP_FILE" "$URL"
elif which uclient-fetch >/dev/null 2>&1; then
  uclient-fetch -q -O "$TMP_FILE" "$URL"
else
  echo "[Error] Neither curl, wget, nor uclient-fetch is available."
  exit 1
fi

if [ -s "$TMP_FILE" ] && [ $(wc -l < "$TMP_FILE") -gt 10 ]; then
  mv "$TMP_FILE" "$CONF_FILE"
  echo "[DNS Shield] Rules updated successfully ($(wc -l < "$CONF_FILE") lines)."
  /etc/init.d/dnsmasq restart
  echo "[DNS Shield] dnsmasq restarted."
else
  echo "[Error] Downloaded file is empty or invalid. Skipping reload."
  rm -f "$TMP_FILE"
  exit 1
fi
`;

    case 'merlin':
      return `#!/bin/sh
# DNS Shield Auto-Sync Script for AsusWRT-Merlin
# 放置路径: /jffs/scripts/dns_shield_update.sh
# 赋予执行权限: chmod +x /jffs/scripts/dns_shield_update.sh
# 挂载到 post-mount 或 nat-start

CONF_FILE="/jffs/configs/dnsmasq.conf.add"
TMP_FILE="/tmp/dnsmasq.conf.add.tmp"
URL=${shellQuote(safeUrl)}

echo "[DNS Shield] Fetching rules for Merlin..."
curl -fsS -m 30 -o "$TMP_FILE" "$URL"

if [ -s "$TMP_FILE" ]; then
  mv "$TMP_FILE" "$CONF_FILE"
  service restart_dnsmasq
  logger -t "DNS_Shield" "Rules updated successfully."
else
  logger -t "DNS_Shield" "Failed to download rules."
  rm -f "$TMP_FILE"
fi
`;

    case 'padavan':
      return `#!/bin/sh
# DNS Shield Auto-Sync Script for Padavan
# 放置路径: /etc/storage/dns_shield.sh

CONF_FILE="/etc/storage/dnsmasq/dnsmasq.conf"
TMP_FILE="/tmp/dnsmasq.tmp"
URL=${shellQuote(safeUrl)}

wget -q -O "$TMP_FILE" "$URL"
if [ -s "$TMP_FILE" ]; then
  mv "$TMP_FILE" "$CONF_FILE"
  mtd_storage.sh save
  restart_dhcpd
  echo "Padavan DNS rules updated."
fi
`;

    case 'smartdns':
      return `#!/bin/sh
# DNS Shield Auto-Sync Script for SmartDNS
# 放置路径: /etc/smartdns/update_rules.sh

CONF_FILE="/etc/smartdns/conf.d/dns-shield.conf"
TMP_FILE="/tmp/smartdns_rules.tmp"
URL=${shellQuote(safeUrl)}

mkdir -p /etc/smartdns/conf.d
curl -fsS -m 30 -o "$TMP_FILE" "$URL"

if [ -s "$TMP_FILE" ]; then
  mv "$TMP_FILE" "$CONF_FILE"
  /etc/init.d/smartdns restart 2>/dev/null || systemctl restart smartdns
  echo "SmartDNS rules reloaded."
fi
`;

    case 'pihole':
      return `#!/bin/bash
# DNS Shield Auto-Sync Script for Pi-hole
# 放置路径: /usr/local/bin/update_pihole_shield.sh

CUSTOM_LIST="/etc/pihole/custom.list"
TMP_FILE="/tmp/pihole_shield.tmp"
URL=${shellQuote(safeUrl)}

curl -s -m 30 -o "$TMP_FILE" "$URL"
if [ -s "$TMP_FILE" ]; then
  mv "$TMP_FILE" "$CUSTOM_LIST"
  pihole restartdns reload
  echo "Pi-hole custom list updated."
fi
`;
  }
}
