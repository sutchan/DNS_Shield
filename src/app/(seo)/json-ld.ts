// src/app/(seo)/json-ld.ts v3.20.0
// 站点级 schema.org @graph：Organization / WebSite / WebPage / SoftwareApplication，
// 由 layout.tsx 全局输出。v3.20.0 将 FAQPage / HowTo 迁到 about-json-ld.ts（/about/ 页专用），
// 使结构化数据与可见正文同页同源；所有文案仍来自 seo-content.ts 单一来源。
import { APP_VERSION } from '../../config/version';
import {
  SITE_URL, GITHUB_URL, SITE_NAME, OG_IMAGE_PATH, ICON_512_PATH,
  SITE_LAST_MODIFIED, IN_LANGUAGE,
} from '../../config/site';
import { ABOUT_ZH, FORMAT_NAMES } from '../../config/seo-content';
import { TITLE, DESCRIPTION } from './meta-content';

/** @graph 中复用的 @id，保证实体之间引用正确 */
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#software`;
const WEBPAGE_ID = `${SITE_URL}/#webpage`;

export const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}${ICON_512_PATH}`, width: 512, height: 512 },
      sameAs: [GITHUB_URL],
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: SITE_URL,
      name: SITE_NAME,
      description: DESCRIPTION,
      publisher: { '@id': ORG_ID },
      inLanguage: [...IN_LANGUAGE],
    },
    {
      '@type': 'WebPage',
      '@id': WEBPAGE_ID,
      url: `${SITE_URL}/`,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': APP_ID },
      primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE_URL}${OG_IMAGE_PATH}` },
      inLanguage: ['zh-CN'],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': APP_ID,
      name: SITE_NAME,
      applicationCategory: 'UtilitiesApplication',
      applicationSubCategory: 'Ad Blocking',
      operatingSystem: 'Web',
      browserRequirements: '需要支持 JavaScript 的现代浏览器',
      softwareVersion: APP_VERSION,
      description: ABOUT_ZH,
      url: SITE_URL,
      downloadUrl: GITHUB_URL,
      image: `${SITE_URL}${OG_IMAGE_PATH}`,
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
      author: { '@type': 'Person', name: 'sutchan', url: GITHUB_URL },
      publisher: { '@id': ORG_ID },
      dateModified: SITE_LAST_MODIFIED,
      featureList: [
        `支持 12 种格式规则生成：${FORMAT_NAMES.join('、')}`,
        '兼容梅林固件、小米路由器、OpenWrt、AdGuard Home、Pi-hole 等设备与软件',
        '解析与规则生成全部在浏览器本地完成，域名清单不上传服务器',
        '自定义黑名单 / 白名单 / DNS 改道，支持 URL 批量导入与实时预览',
        '一键复制 / 下载规则文件，并提供 16 种界面语言',
      ],
      inLanguage: [...IN_LANGUAGE],
    },
  ],
};
