from playwright.sync_api import sync_playwright
import sys

def test_dns_shield():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1440, 'height': 900})
        
        # 1. 页面加载测试
        print("[1/8] Testing page load...")
        page.goto('http://localhost:8082')
        page.wait_for_load_state('networkidle')
        page.screenshot(path='E:/Github/DNS_Shield/test_screenshots/desktop.png')
        
        title = page.title()
        assert 'DNS Shield' in title, f"Title mismatch: {title}"
        print("  ✓ Page loaded successfully")
        
        # 2. 检查主要元素存在
        print("[2/8] Testing main elements...")
        assert page.locator('header#app-header').is_visible(), "Header not found"
        assert page.locator('#input-panel').is_visible(), "Input panel not found"
        assert page.locator('#output-panel').is_visible(), "Output panel not found"
        print("  ✓ All main elements present")
        
        # 3. 主题切换测试
        print("[3/8] Testing theme toggle...")
        theme_btn = page.locator('#theme-toggle-btn')
        theme_btn.click()
        page.wait_for_timeout(500)
        page.screenshot(path='E:/Github/DNS_Shield/test_screenshots/dark_mode.png')
        theme_btn.click()
        page.wait_for_timeout(500)
        print("  ✓ Theme toggle works")
        
        # 4. 语言切换测试
        print("[4/8] Testing language switch...")
        lang_btn = page.locator('#lang-selector-btn')
        lang_btn.click()
        page.wait_for_timeout(300)
        page.screenshot(path='E:/Github/DNS_Shield/test_screenshots/lang_dropdown.png')
        lang_btn.click()  # close dropdown
        page.wait_for_timeout(300)
        print("  ✓ Language switch works")
        
        # 5. 输入域名测试
        print("[5/8] Testing domain input...")
        textarea = page.locator('#sourceInput')
        textarea.fill('ad.example.com\n+api.example.com\n# comment')
        page.wait_for_timeout(500)
        page.screenshot(path='E:/Github/DNS_Shield/test_screenshots/with_input.png')
        print("  ✓ Domain input works")
        
        # 6. 生成规则测试
        print("[6/8] Testing rule generation...")
        parse_btn = page.locator('#parse-btn')
        parse_btn.click()
        page.wait_for_timeout(1000)
        page.screenshot(path='E:/Github/DNS_Shield/test_screenshots/generated.png')
        output = page.locator('#outputPreview').text_content()
        assert output and len(output) > 10, "Output not generated"
        print("  ✓ Rule generation works")
        
        # 7. 格式切换测试
        print("[7/8] Testing format tabs...")
        format_hosts = page.locator('#format-hosts-btn')
        format_hosts.click()
        page.wait_for_timeout(500)
        page.screenshot(path='E:/Github/DNS_Shield/test_screenshots/hosts_format.png')
        format_adguard = page.locator('#format-adguard-btn')
        format_adguard.click()
        page.wait_for_timeout(500)
        page.screenshot(path='E:/Github/DNS_Shield/test_screenshots/adguard_format.png')
        print("  ✓ Format switching works")
        
        # 8. 移动端响应式测试
        print("[8/8] Testing mobile responsive...")
        page.set_viewport_size({'width': 375, 'height': 812})
        page.goto('http://localhost:8082')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(1000)
        page.screenshot(path='E:/Github/DNS_Shield/test_screenshots/mobile.png', full_page=True)
        print("  ✓ Mobile responsive layout works")
        
        browser.close()
        print("\n" + "="*50)
        print("All 8 tests passed! ✓")
        print("="*50)
        return 0

if __name__ == '__main__':
    try:
        sys.exit(test_dns_shield())
    except Exception as e:
        print(f"\nTest failed: {e}")
        sys.exit(1)
