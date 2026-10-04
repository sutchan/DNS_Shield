-- openwrt-package/luasrc/controller/dnsshield.lua
-- DNS Shield 规则订阅控制器：在 OpenWrt 后台拉取并落地过滤规则。
-- 规则写入 /etc/dnsshield/rules.conf（hosts 格式），供 dnsmasq / AdGuardHome 引用。

local fs = require "nixio.fs"
local uhttp = require "luci.http"

local RULES_DIR = "/etc/dnsshield"
local RULES_FILE = RULES_DIR .. "/rules.conf"
local TMP_FILE = RULES_DIR .. "/.download"
-- 与 Web 端 domainFetch 的 10MB 上限保持一致，防止超大响应撑爆闪存
local MAX_BYTES = 10 * 1024 * 1024

module("luci.controller.dnsshield", package.seeall)

local function ensure_dir()
  if not fs.access(RULES_DIR) then
    fs.mkdirr(RULES_DIR)
  end
end

local function rules_size()
  if not fs.access(RULES_FILE) then return 0 end
  return fs.stat(RULES_FILE, "size") or 0
end

-- 仅接受 http/https，避免注入到 shell 命令
local function valid_url(url)
  return type(url) == "string" and url:match("^https?://[^%s]+$") ~= nil
end

local function download(url)
  local tmp = TMP_FILE
  fs.remove(tmp)
  -- url 已由 valid_url 校验为 https?:// + 非空白字符，不含引号
  local cmd = ("uclient-fetch -q -O '%s' --timeout=20 '%s' 2>/dev/null"):format(tmp, url)
  if os.execute(cmd) ~= 0 or not fs.access(tmp) then
    fs.remove(tmp)
    return nil, "fetch failed"
  end
  local size = fs.stat(tmp, "size") or 0
  if size <= 0 or size > MAX_BYTES then
    fs.remove(tmp)
    return nil, "unexpected rule file size"
  end
  return tmp
end

local function reload_dns()
  -- 重载 dnsmasq 使新规则生效；不存在时静默忽略
  os.execute("/etc/init.d/dnsmasq reload >/dev/null 2>&1")
end

function index()
  local page = entry({ "admin", "system", "dnsshield" }, alias("admin", "system", "dnsshield"),
                      "DNS Shield", 60)
  page.dependent = true

  local action = uhttp.formvalue("action")
  if action == "refresh" then
    local url = uhttp.formvalue("url")
    if not valid_url(url) then
      uhttp.status(400, "Content-Type: text/plain")
      uhttp.write("invalid url")
      return
    end
    ensure_dir()
    local tmp, err = download(url)
    if not tmp then
      uhttp.status(502, "Content-Type: text/plain")
      uhttp.write(err)
      return
    end
    fs.rename(tmp, RULES_FILE)
    reload_dns()
  end

  uhttp.prepare_content("application/json")
  uhttp.write(require "cjson".encode({
    rules_file = RULES_FILE,
    bytes = rules_size()
  }))
end
