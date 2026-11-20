// src/app/(seo)/json-ld.ts v3.19.1
// schema.org 结构化数据 @graph：Organization / WebSite / WebPage /
// SoftwareApplication / FAQPage / HowTo。从 site-meta.ts 按职责拆出以守住 200 行上限。
// 所有事实文本来自 config/seo-content.ts 与 meta-content.ts，与页面可见文本同源。
import { APP_VERSION } from '../../config/version';
import {
  SITE_URL, GITHUB_URL, SITE_NAME, OG_IMAGE_PATH, ICON_512_PATH,
  SITE_LAST_MODIFIED, IN_LANGUAGE,
} from '../../config/site';
import { ABOUT_ZH, FORMAT_NAMES, FAQ_ITEMS, HOWTO_STEPS } from '../../config/seo-content';
import { TITLE, DESCRIPTION } from './meta-content';

/** @graph 中复用的 @id，保证实体之间引用正确 */
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#software`;
const WEBPAGE_ID = `${SITE_URL}/#webpage`;
// 与页面可见锚点一一对应：#faq（SeoContent.tsx）、#howto（FlowViz.tsx 快速入门 h2）
const FAQ_ID = `${SITE_URL}/#faq`;
const HOWTO_ID = `${SITE_URL}/#howto`;

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
      // FAQPage / HowTo 作为页面组成部分，与可见区块同源
      hasPart: [{ '@id': FAQ_ID }, { '@id': HOWTO_ID }],
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
    {
      '@type': 'FAQPage',
      '@id': FAQ_ID,
      inLanguage: 'zh-CN',
      // 问题与答案必须与页面 #faq 区块的可见文本逐字一致，避免结构化数据与正文不符。
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    {
      '@type': 'HowTo',
      '@id': HOWTO_ID,
      inLanguage: 'zh-CN',
      name: '如何使用 DNS Shield 生成路由器广告过滤规则',
      description: '从输入域名清单到导出部署的三步流程。',
      totalTime: 'PT2M',
      tool: [{ '@type': 'HowToTool', name: 'DNS Shield 在线工具（现代浏览器）' }],
      supply: [{ '@type': 'HowToSupply', name: '需要过滤的广告 / 追踪域名清单' }],
      step: HOWTO_STEPS.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.name,
        text: s.text,
        // 指向页面可见的对应步骤区块，抓取器可将结构化数据与正文关联
        url: `${SITE_URL}/#howto`,
      })),
    },
  ],
};
