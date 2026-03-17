# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6]

### Changed
- Enhanced UI design with gradient backgrounds and smooth animations
- Improved panel hover effects with gradient top border
- Redesigned buttons with gradient backgrounds and enhanced shadows
- Added input focus states with accent glow
- Updated color scheme for better visual hierarchy
- Comment lines (#domain and !domain syntax) no longer counted in domain count

### Added
- Save button now uses File System Access API to save directly to project directory

### Fixed
- Renamed `manager.html` to `index.html` for consistency with web standards

## [1.0.5]

### Changed
- Synchronized all file version numbers to v1.0.5
- Updated SPEC.md version references
- Updated README version badges
- Updated output file headers (dnsmasq.conf, hosts.txt)

### Fixed
- Fixed version inconsistency across project files
- Verified code robustness and updated documentation

## [1.0.4]

### Changed
- Updated output file descriptions to be router-agnostic (通用路由器支持)
- Removed Xiaomi-specific references from generator.js
- Standardized hosts file header descriptions

### Fixed
- Fixed SPEC.md and CHECKLIST.md to reflect current file structure
- Fixed domain count in output file headers (6766 domains)
- Removed duplicate app.js entries in CHECKLIST.md

### Removed
- Removed deprecated ui.js (split into ui-urls.js, ui-editor.js, ui-controls.js)

## [1.0.2] - 2026-03-14

### Changed
- **File Renaming**: Standardized all file names for consistency
  - `dnsmasq-ads-filter-list.txt` → `dnsmasq.conf`
  - `xiaomi-router-hosts-noad.txt` → `hosts.txt`
  - `raw-domains.txt` → `domains.txt`
  - `README_CN.md` → `README.zh-CN.md` (ISO 639-1 standard)
  - `hosts-manager.html` → `manager.html`
- Updated all internal references in `manager.html` to use new file names
- Updated README.md and README.zh-CN.md with new file references

### Fixed
- Fixed `domains.txt` rule documentation (`@` syntax)
- Fixed `manager.html` to support whitelist (`+`), comment domain (`!`), and custom DNS (`@`) prefixes
- Regenerated output files with correct domain count

### Added
- Support for whitelist domains (`+` prefix) in `manager.html`
- Support for comment domains (`!` prefix) in `manager.html`
- Support for custom DNS (`@` prefix) in `manager.html`
- Display of whitelist and custom DNS counts in output info

## [1.0.1] - 2026-03-14

### Fixed
- Fixed IPv6 address format in Dnsmasq rules (`address=/domain/::` instead of `address=/domain::/`)
- Fixed duplicate HTML element `blockIPv6` checkbox
- Fixed JavaScript function structure issues in `hosts-manager.html`
- Fixed duplicate translation objects in JavaScript

### Changed
- Regenerated `dnsmasq-ads-filter-list.txt` with correct format and standard header
- Regenerated `xiaomi-router-hosts-noad.txt` with correct format and standard header
- Updated IP address from `127.0.0.1` to `0.0.0.0` for consistency
- Converted `README.md` from HTML to Markdown format
- Updated `README_CN.md` with complete documentation
- Added file header comment to `hosts-manager.html`

### Added
- Standard header comments to output files
- Version number in HTML title
- Single source workflow documentation

## [1.0.0] - 2026-03-13

### Added
- Initial release
- Dnsmasq ad blocking filter list
- Xiaomi router hosts file
- Web management tool (`hosts-manager.html`)
- Raw domains source file (`raw-domains.txt`)
- Project documentation (README.md, README_CN.md)
- OpenSpec documentation (SPEC.md, TASKS.md, CHECKLIST.md)
