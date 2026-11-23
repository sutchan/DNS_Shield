// src/app/(seo)/about-json-ld.ts v3.20.0
// /about/ 页面级结构化数据：WebPage + FAQPage + HowTo。
// v3.20.0 前这三类与站点级实体同处 layout 全局 @graph，导致首页「有 FAQPage schema
// 却无可见 FAQ 正文」——迁移后 schema 与可见文本重新同页同源。
import { SITE_URL, SITE_NAME, SITE_LAST_MODIFIED } from '../../config/site';
import { FAQ_ITEMS, HOWTO_STEPS } from '../../config/seo-content';

const ABOUT_URL = `${SITE_URL}/about/`;
const FAQ_ID = `${ABOUT_URL}#faq`;
const HOWTO_ID = `${ABOUT_URL}#howto`;

export const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${ABOUT_URL}#webpage`,
      url: ABOUT_URL,
      name: `关于与常见问题 | ${SITE_NAME}`,
      description: '项目定义、使用步骤、部署要点、12 种导出格式与常见问题。',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#software` },
      hasPart: [{ '@id': FAQ_ID }, { '@id': HOWTO_ID }],
      dateModified: SITE_LAST_MODIFIED,
      inLanguage: ['zh-CN'],
    },
    {
      '@type': 'FAQPage',
      '@id': FAQ_ID,
      url: `${ABOUT_URL}#faq`,
      inLanguage: 'zh-CN',
      // 问题与答案与 /about/ 页 #faq 区块可见文本逐字一致
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
    {
      '@type': 'HowTo',
      '@id': HOWTO_ID,
      url: `${ABOUT_URL}#howto-static`,
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
        url: `${ABOUT_URL}#howto-static`,
      })),
    },
  ],
};
