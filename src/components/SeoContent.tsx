// src/components/SeoContent.tsx v3.19.1
// 站点事实内容（关于 / 使用步骤 / 部署要点 / 12 种格式 / FAQ）：GEO 的核心是可抓取、可引用的可见文本。
// 本项目是纯客户端单页应用，此前 HTML 中只有一句 Hero 描述与三步快速入门，
// 搜索引擎与 LLM 几乎无从引用。此区块在服务端预渲染时即进入 HTML（不依赖 localStorage），
// 内容与 JSON-LD 的 FAQPage / HowTo 以及 /llms.txt 全部由 seo-content.ts 单一来源派生。
// v3.19.1：补页内目录 nav、HowTo 三步可见文本、DEPLOY_GUIDES 常驻正文；
//   机器链接包进 nav；语义化 id 保持 kebab-case。
'use client';
import {
  ABOUT_ZH, ABOUT_EN, OUTPUT_FORMATS, FAQ_ITEMS, HOWTO_STEPS, DEPLOY_GUIDES,
} from '../config/seo-content';

export default function SeoContent() {
  return (
    <div className="seo-content" id="site-info">
      {/* 页内目录：提升内链深度与可抓取层级，锚点均指向本页真实存在的区块 */}
      <nav className="seo-toc" id="seo-toc" aria-label="页面目录">
        <a href="#howto">使用步骤</a>
        <span aria-hidden="true"> · </span>
        <a href="#about">关于</a>
        <span aria-hidden="true"> · </span>
        <a href="#formats-heading">支持格式</a>
        <span aria-hidden="true"> · </span>
        <a href="#deploy-heading">部署要点</a>
        <span aria-hidden="true"> · </span>
        <a href="#faq">常见问题</a>
      </nav>

      <div className="seo-grid">
        <section id="howto-static" aria-labelledby="howto-static-heading">
          <h2 id="howto-static-heading">三步生成广告过滤规则</h2>
          <ol className="seo-steps">
            {HOWTO_STEPS.map((s, i) => (
              <li key={s.name}>
                <strong>{i + 1}. {s.name}</strong>：{s.text}
              </li>
            ))}
          </ol>
        </section>

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

        <section id="deploy" aria-labelledby="deploy-heading">
          <h2 id="deploy-heading">常见部署方式</h2>
          <ul className="seo-deploy">
            {DEPLOY_GUIDES.map((g) => (
              <li key={g.name}>
                <strong>{g.name}</strong>：{g.text}
              </li>
            ))}
          </ul>
        </section>

        <section id="faq" aria-labelledby="faq-heading">
          <h2 id="faq-heading">常见问题</h2>
          {/* 折叠问答：默认收起答案，缩短长页面；内容仍在 SSR HTML 中供 GEO 抓取 */}
          <div className="seo-faq">
            {FAQ_ITEMS.map((item) => (
              <details className="seo-faq-item" key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <nav className="seo-machine" id="seo-machine-links" aria-label="机器可读资源">
        供搜索引擎与生成式引擎读取：
        <a href="/llms.txt">llms.txt</a>
        <span aria-hidden="true"> · </span>
        <a href="/sitemap.xml">sitemap.xml</a>
        <span aria-hidden="true"> · </span>
        <a href="/robots.txt">robots.txt</a>
      </nav>
    </div>
  );
}
