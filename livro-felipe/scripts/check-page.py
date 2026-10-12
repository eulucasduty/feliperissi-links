"""Check the real page at desktop/mobile sizes and its primary interactions."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
import sys

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8000/livro-felipe/'
OUT = Path.home() / '.codex' / 'artifacts' / 'recomeco'
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    report = []
    for width, height, label in [(1440, 1000, 'desktop'), (390, 844, 'mobile'), (320, 800, 'small-mobile'), (768, 1024, 'tablet')]:
        page = browser.new_page(viewport={'width': width, 'height': height}, device_scale_factor=1)
        errors, bad_responses = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('response', lambda response: bad_responses.append(f'{response.status} {response.url}') if response.status >= 400 else None)
        response = page.goto(URL, wait_until='networkidle')
        assert response.status == 200, response.status
        page.evaluate('document.fonts.ready')
        page.evaluate('document.querySelectorAll("img").forEach(img => img.loading = "eager")')
        page.locator('footer').scroll_into_view_if_needed()
        page.wait_for_function('Array.from(document.images).every(img => img.complete && img.naturalWidth > 0)')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Horizontal overflow at {width}'
        assert page.locator('h1').evaluate('(el) => el.scrollWidth <= el.clientWidth'), f'Heading overflow at {width}'
        background = page.locator('.hero-background img').evaluate('(el) => el.currentSrc')
        assert ('mobile' if width <= 700 else 'desktop') in background, background
        assert page.locator('h1').count() == 1
        assert not page.locator('.vsl-play').is_visible(), 'Empty VSL must not show a fake play control'
        assert page.locator('iframe, video').count() == 0, 'VSL must load only after configuration and interaction'
        assert page.locator('.checkout-link').get_attribute('href') == 'https://app.ephra.io/checkout/v2/izv1zkf'
        assert page.locator('a[href="#"]').count() == 0, 'Dead placeholder link'
        page.locator('.journey-list summary').first.click()
        assert page.locator('.journey-list details').first.get_attribute('open') is not None
        page.locator('.journey-list summary').first.press('Enter')
        assert page.locator('.journey-list details').first.get_attribute('open') is None
        page.locator('.faq-list summary').last.click()
        assert page.locator('.faq-list details').last.locator('p').is_visible()
        page.locator('.faq-list summary').last.click()
        page.locator('.hero-action a').click()
        assert page.evaluate('location.hash') == '#oferta'
        page.locator('.footer-back').click()
        assert page.evaluate('location.hash') == '#inicio'
        page.emulate_media(reduced_motion='reduce')
        page.evaluate('scrollTo(0, 0)')
        page.screenshot(path=str(OUT / f'{label}-hero.png'))
        if label in ['desktop', 'mobile']:
            page.screenshot(path=str(OUT / f'{label}-full.png'), full_page=True)
            for selector, section in [('.devotional', 'ebook'), ('.sample-section', 'sample'), ('.community-section', 'community'), ('.offer-section', 'offer')]:
                page.locator(selector).screenshot(path=str(OUT / f'{label}-{section}.png'))
        assert not errors, errors
        assert not bad_responses, bad_responses
        report.append({'viewport': label, 'width': width, 'height': page.evaluate('document.documentElement.scrollHeight'), 'consoleErrors': errors, 'failedResponses': bad_responses})
        page.close()

    # Exercise the configured embed without loading a real third-party video.
    page = browser.new_page()
    page.route('**/config.js', lambda route: route.fulfill(content_type='application/javascript', body='window.RECOMECO_CONFIG={vsl:{type:"embed",url:"https://video.example.test/embed/123"}};'))
    page.route('https://video.example.test/**', lambda route: route.fulfill(content_type='text/html', body='<html><body>Video embed test</body></html>'))
    page.goto(URL, wait_until='networkidle')
    assert page.locator('.vsl-play').is_visible()
    assert page.locator('iframe').count() == 0
    page.locator('.vsl-play').click()
    assert page.locator('iframe').get_attribute('src') == 'https://video.example.test/embed/123'
    assert page.locator('iframe').get_attribute('title')
    assert not page.locator('.vsl-play').is_visible()
    page.close()
    browser.close()
    (OUT / 'validation.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({'checks': report, 'embed': 'passed', 'screenshots': str(OUT)}, indent=2))
