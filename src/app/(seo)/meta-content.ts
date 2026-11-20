// src/app/(seo)/meta-content.ts v3.19.1
// 站点标题与描述的单一来源，供 metadata（site-meta.ts）与结构化数据（json-ld.ts）共用，
// 避免两处文案漂移导致 OpenGraph / JSON-LD 与页面标题不一致。
import { SITE_NAME } from '../../config/site';

/** 标题不嵌版本号：版本随发版频繁变化会造成标题漂移，不利于关键词稳定性。 */
export const TITLE = `${SITE_NAME} - 路由器级广告过滤规则生成工具（12 种格式）`;

export const DESCRIPTION =
  '免费开源的路由器级 DNS 广告过滤规则生成工具。在浏览器本地把域名清单转换为 Dnsmasq、Hosts、AdGuard、Pi-hole、Clash Meta 等 12 种格式，兼容梅林固件、OpenWrt、小米路由器；无需注册，域名清单不上传服务器。';
