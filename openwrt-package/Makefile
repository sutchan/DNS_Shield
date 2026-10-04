# openwrt-package/Makefile
# OpenWrt LuCI 应用包：DNS Shield 过滤规则订阅
# 版本号与 Web 端保持同步（权威源为 Web 项目 package.json）
include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-dnsshield
PKG_VERSION:=3.11.0
PKG_RELEASE:=1
PKG_LICENSE:=MIT
PKG_MAINTAINER:=ArcesTeam

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-dnsshield
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=DNS Shield rule subscription
  DEPENDS:=+luci-base +uclient-fetch
  PKGARCH:=all
endef

define Package/luci-app-dnsshield/description
  Subscribe and refresh DNS Shield ad-blocking rule feeds from the OpenWrt
  web interface. Rules are written to /etc/dnsshield/rules.conf in hosts
  format, ready for dnsmasq addn-hosts or AdGuardHome.
endef

define Build/Compile
endef

define Package/luci-app-dnsshield/install
	$(INSTALL_DIR) $(1)/usr/lib/lua/luci/controller
	$(INSTALL_DATA) ./luasrc/controller/dnsshield.lua \
		$(1)/usr/lib/lua/luci/controller/dnsshield.lua
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/luci-app-dnsshield.json \
		$(1)/usr/share/luci/menu.d/luci-app-dnsshield.json
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/luci-app-dnsshield.json \
		$(1)/usr/share/rpcd/acl.d/luci-app-dnsshield.json
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./root/dnsshield.config $(1)/etc/config/dnsshield
endef

define Package/luci-app-dnsshield/conffiles
/etc/config/dnsshield
endef

$(eval $(call BuildPackage,luci-app-dnsshield))
