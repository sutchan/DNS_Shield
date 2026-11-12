// src/components/SeoContent.tsx v3.18.0
// 站点事实内容（关于 / 12 种格式 / 常见问题）：GEO 的核心是可抓取、可引用的可见文本。
// 本项目是纯客户端单页应用，此前 HTML 中只有一句 Hero 描述与三步快速入门，
// 搜索引擎与 LLM 几乎无从引用。此区块在服务端预渲染时即进入 HTML（不依赖 localStorage），
// 内容与 JSON-LD 的 FAQPage / HowTo 以及 /llms.txt 全部由 seo-content.ts 单一来源派生。
'use client';
import { ABOUT_ZH, ABOUT_EN, OUTPUT_FORMATS, FAQ_ITEMS } from '../config/seo-content';

export default function SeoContent() {
  return (
    <div className="seo-content" id="site-info">
      <div className="seo-grid">
        <section id="about" aria-labelledby="about-heading">
          <h2 id="about-heading">关于 DNS Shield</h2>
          <p>{ABOUT_ZH}</p>
          <p className="seo-en" lang="en">{ABOUT_EN}</p>

          <h3 id="formats-heading">支持的 12 种导出格式</h3>
          <ul className="seo-formats" aria-labelledby="formats-heading">
            {OUTPUT_FORMATS.map((f) => (
              <li key={f.file}>
                <a href={`/${f.file}`} target="_blank" rel="noopener noreferrer">{f.name}</a>
                <span>{f.target}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="faq" aria-labelledby="faq-heading">
          <h2 id="faq-heading">常见问题</h2>
          <dl className="seo-faq">
            {FAQ_ITEMS.map((item) => (
              <div className="seo-faq-item" key={item.q}>
                <dt>{item.q}</dt>
                <dd>{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <p className="seo-machine">
        供搜索引擎与生成式引擎读取：
        <a href="/llms.txt">llms.txt</a>
        <span aria-hidden="true"> · </span>
        <a href="/sitemap.xml">sitemap.xml</a>
        <span aria-hidden="true"> · </span>
        <a href="/robots.txt">robots.txt</a>
      </p>
    </div>
  );
}
