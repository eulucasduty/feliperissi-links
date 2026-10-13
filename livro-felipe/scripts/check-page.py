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
        page.wait_for_function('Array.from(document.images).filter(img => img.hasAttribute("src")).every(img => img.complete && img.naturalWidth > 0)')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Horizontal overflow at {width}'
        assert page.locator('h1').evaluate('(el) => el.scrollWidth <= el.clientWidth'), f'Heading overflow at {width}'
        background = page.locator('.hero-background img').evaluate('(el) => el.currentSrc')
        assert ('mobile' if width <= 700 else 'desktop') in background, background
        assert page.locator('h1').count() == 1
        has_vsl = page.evaluate('Boolean(window.RECOMECO_CONFIG?.vsl?.url)')
        assert page.locator('.vsl-play').is_visible() == has_vsl, 'Play control must match VSL configuration'
        assert page.locator('iframe, video').count() == 0, 'VSL must load only after configuration and interaction'
        assert page.locator('.checkout-link').get_attribute('href') == 'https://app.ephra.io/checkout/v2/izv1zkf'
        assert page.locator('a[href="#"]').count() == 0, 'Dead placeholder link'
        assert page.locator('img[src*="ebook-processos"]').count() == 0, 'All book covers must be official'
        assert page.locator('img[src="assets/capa-original.webp"]').count() == 2
        assert page.locator('.book-benefits-list li').count() == 7
        assert page.locator('.community-benefits').get_by_text('Lives diárias', exact=True).count() == 1
        assert page.locator('.community-identity img').is_visible()
        assert 'WhatsApp' in page.locator('.community-identity').inner_text()
        assert page.locator('.community-benefits .benefit-icon img').count() == 5
        assert page.locator('.community-benefits .benefit-icon').all_inner_texts() == ['', '', '', '', '']
        assert page.locator('.author-avatar').get_attribute('src') == 'assets/felipe-rissi-perfil.webp'
        carousel = page.locator('.page-carousel')
        assert carousel.locator('[data-book-page]:not([hidden])').count() == 1
        carousel.locator('[data-carousel-next]').click()
        assert '2 de 4' in carousel.locator('.carousel-counter').inner_text()
        assert carousel.locator('.book-day').inner_text() == 'Dia 2'
        carousel.locator('[data-carousel-next]').click()
        assert '3 de 4' in carousel.locator('.carousel-counter').inner_text()
        assert carousel.locator('.book-day').inner_text() == 'Dia 3'
        assert page.locator('[data-book-page]').nth(2).is_visible()
        assert carousel.locator('[data-book-page]:not([hidden])').count() == 1
        # Rapid opposite turns must settle on the selected page without stale leaves.
        carousel.locator('[data-carousel-prev]').click()
        carousel.locator('[data-carousel-prev]').click()
        page.wait_for_function('!document.querySelector(".book-stage").dataset.turning')
        assert page.locator('[data-book-page]').first.is_visible()
        assert page.locator('.turning-sheet').count() == 0
        previews = page.locator('.page-preview')
        previews.first.click()
        viewer = page.locator('#page-viewer')
        assert viewer.is_visible()
        page.wait_for_function('document.querySelector(".viewer-image").complete && document.querySelector(".viewer-image").naturalWidth > 0')
        assert '108' in viewer.locator('#page-viewer-title').inner_text()
        viewer.locator('[data-viewer-zoom]').click()
        assert viewer.locator('[data-viewer-zoom]').get_attribute('aria-pressed') == 'true'
        assert viewer.locator('.viewer-body').evaluate('(el) => el.scrollWidth > el.clientWidth')
        viewer.locator('[data-viewer-next]').click()
        assert '109' in viewer.locator('#page-viewer-title').inner_text()
        assert viewer.locator('[data-viewer-zoom]').get_attribute('aria-pressed') == 'false'
        page.keyboard.press('Escape')
        assert not viewer.is_visible()
        assert previews.first.evaluate('(el) => document.activeElement === el')
        previews.first.press('ArrowRight')
        assert '2 de 4' in carousel.locator('.carousel-counter').inner_text()
        previews.nth(1).press('ArrowLeft')
        assert '1 de 4' in carousel.locator('.carousel-counter').inner_text()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'Gallery must not overflow the document'
        ipad = page.locator('.ipad-carousel')
        assert ipad.locator('[data-ipad-slide]:not([hidden])').count() == 1
        ipad.locator('[data-ipad-next]').click()
        assert '2 de 3' in ipad.locator('.ipad-counter').inner_text()
        assert ipad.locator('[data-ipad-slide]:not([hidden])').inner_text().strip().startswith('“')
        ipad.locator('[data-ipad-next]').press('ArrowRight')
        assert '3 de 3' in ipad.locator('.ipad-counter').inner_text()
        assert 'A sua história não terminou' in ipad.locator('[data-ipad-slide]:not([hidden])').inner_text()
        ipad.locator('[data-ipad-dot="0"]').click()
        page.emulate_media(reduced_motion='reduce')
        carousel.locator('[data-carousel-next]').click()
        assert page.locator('.turning-sheet').count() == 0
        carousel.locator('[data-carousel-prev]').click()
        assert carousel.locator('.book-day').inner_text() == 'Dia 2'
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
        page.evaluate('document.activeElement.blur()')
        page.evaluate('scrollTo(0, 0)')
        page.screenshot(path=str(OUT / f'{label}-hero.png'))
        if label in ['desktop', 'mobile']:
            page.screenshot(path=str(OUT / f'{label}-full.png'), full_page=True)
            for selector, section in [('.recognition', 'gallery'), ('.devotional', 'ebook'), ('.book-benefits-section', 'benefits'), ('.sample-section', 'sample'), ('.community-section', 'community'), ('.offer-section', 'offer')]:
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
