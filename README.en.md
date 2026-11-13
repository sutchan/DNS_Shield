![DNS Shield Brand Banner](public/brand-banner.svg)

![DNS Shield](public/logo.svg)

<!-- Last reviewed: 2026-11-13 (aligned with package.json version) -->

[![English](https://img.shields.io/badge/language-English-blue)](README.en.md) [![中文](https://img.shields.io/badge/language-中文-red)](README.md) [![Version](https://img.shields.io/badge/version-3.19.0-green)](https://github.com/sutchan/DNS_Shield) [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org) [![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Router-level DNS-based ad blocking filter list with a web management tool. It both **generates** rule lists from a unified domain source and **converts** existing lists between different formats.

## Overview

- **Block ads & trackers** — web, video and in-app ads plus trackers
- **Payment protection** — blocks QR-payment redirect links (WeChat, Alipay)
- **Whole-network coverage** — configure the router once, every device is protected
- **12 output formats** — Dnsmasq, Hosts, AdGuard (block/allow), plain domains, Unbound, Pi-hole, Bind RPZ, SmartDNS, Mosdns, Clash Meta, CoreDNS
- **Format conversion** — paste any format (hosts / dnsmasq / AdGuard / plain domains) and convert to your target format
- **Whitelist / custom DNS** — `+domain` to allow, `@domain=ip` to override resolution
- **URL import** — fetch a remote domain list (with timeout and size cap)
- **Preset sources** — built-in AdGuard, EasyList, NeoHosts, etc.
- **Rule tester** — enter a domain and instantly see the matched tier (allow / redirect / block / pass-through) and resolution behavior
- **Router sync scripts** — one-click OpenWrt / Merlin / Padavan / SmartDNS / Pi-hole update & reload shell scripts
- **Local auto-save** — saved to the browser every 30s, restored on reload
- **16 languages / dark & light** — one-click switch, full i18n coverage
- **Security hardening** — CSP, HSTS, secure PWA caching, filename sanitization
- **Parallel parsing** — inputs of 20000+ lines are sharded across Web Workers with fallback to a single worker / main thread

## Usage

### Step 1: Download rules

| Router | File |
|--------|------|
| Merlin / OpenWrt | [dnsmasq.conf](public/dnsmasq.conf) |
| Xiaomi / ASUS / TP-Link | [hosts.txt](public/hosts.txt) |
| AdGuard users | [adguard.txt](public/adguard.txt) |

### Step 2: Import into the router

- **Merlin (ASUS)** — Software Center → DNS Settings → Custom dnsmasq, paste the contents of `dnsmasq.conf`
- **OpenWrt** — `curl -sL https://raw.githubusercontent.com/sutchan/DNS_Shield/main/public/dnsmasq.conf >> /etc/dnsmasq.conf`
- **Xiaomi** — Settings → Advertising Blocking → Custom hosts, import `hosts.txt`

More models and sync scripts: [Deployment Guide](DEPLOYMENT.md).

## Web Manager

To customize domains or generate other formats, use the tool online at [https://dns.ewuse.com](https://dns.ewuse.com/); deployment details in [Deployment Guide](DEPLOYMENT.md).

## Files

All formats are derived from the single `domains.txt` source; `whitelist.txt` releases mistakenly blocked domains.

| File | Description |
|------|-------------|
| `dnsmasq.conf` | Dnsmasq router format (`address=/domain/0.0.0.0`) |
| `hosts.txt` | Standard hosts format (`0.0.0.0 domain`) |
| `adguard.txt` | AdGuard block/allow format (`\|\|domain^`) |
| `whitelist.txt` | Whitelist (domains to allow, `+domain` syntax) |
| `domains.txt` | Unified domain source (source of truth) |
| `unbound.conf` / `pihole.txt` / `rpz.db` / `smartdns.conf` / `mosdns_domain_set.txt` / `clash_dns.yaml` / `coredns_hosts.txt` | The other 7 format outputs |

## Format Conversion

Besides generating from `domains.txt`, DNS Shield also **converts existing lists between formats**:

- **Auto-detection** — when you paste hosts / dnsmasq / AdGuard / plain-domain text, `parseDomainLine` detects each line's format and extracts domains / whitelist (`+`) / custom DNS (`@`) / comments (`#`)
- **Unified model** — entries are parsed into a unified domain-item model (blocked, target IP, whitelist flag)
- **Any-format output** — pick the target format from the "Format" dropdown in the output panel

Typical use: paste an AdGuard list and convert it to dnsmasq or Pi-hole in one click; turn a legacy hosts list into SmartDNS / Bind RPZ.

## Data Flow

```
Unified source (public/domains.txt, whitelist.txt)
        │  useDomainData (remote fetch + timeout/fallback)
        ▼
  Parse (parser.ts + domainValidator.ts)
        │  ≥20000 lines → useWorkerPool sharded across Web Workers
        │  (fallback: single worker → main thread)
        ▼
  Sort & dedupe (sortDedupe.ts)
        ▼
  Generate rules (rulesGenerator.ts, useRules real-time)
        ▼
  Output 12 formats → copy / download
```

Key points: one source derives every format; parsing / validation / sort / generation are pure functions covered by Vitest; local-first (30s auto-save).

## Project Structure

Full module list in [docs/SPEC.md](docs/SPEC.md) §2. Core directories:

- `src/app/` — Next.js App Router (pages, layout, SEO / PWA / llms.txt routes)
- `src/components/` — UI components (`ui/` are shadcn primitives)
- `src/hooks/` `src/utils/` — business logic and pure functions (with Vitest tests)
- `src/locales/` — 16 language translations (zh-cn fallback)
- `src/styles/` — design-system styles (8 modules by responsibility)
- `src/config/` — defaults / version / site facts / SEO copy

## Development

```bash
pnpm install     # install dependencies
pnpm dev         # dev mode (port 3000)
pnpm build       # production build
pnpm lint        # lint
pnpm test        # unit tests (Vitest)
```

## Docs & Conventions

- Spec & architecture: [docs/SPEC.md](docs/SPEC.md)
- Deployment: [DEPLOYMENT.md](DEPLOYMENT.md)
- Contributing: [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md)
- Security: [.github/SECURITY.md](.github/SECURITY.md)
- Changelog: [CHANGELOG.md](CHANGELOG.md)

## License

MIT License

## Version

Current version: v3.18.0. See [CHANGELOG.md](CHANGELOG.md) for the full history.
