const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { chromium } = require('C:/Users/golde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

function loadCopy(file) {
  const filename = path.resolve(file);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loaded = new Module(filename, module);
  loaded._compile(code, filename);
  return loaded.exports;
}

async function main() {
  const { LEGAL_EN, LEGAL_NO, LEGAL_PAGE_SLUGS } = loadCopy('lib/legal-content.ts');
  const { LEGAL_TRANSLATIONS } = loadCopy('lib/legal-translations.ts');
  const copies = { no: LEGAL_NO, en: LEGAL_EN, ...LEGAL_TRANSLATIONS };
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = 'http://localhost:3000';
    const optionalNames = ['ntnui_locale', 'ntnui_theme'];
    const readCookies = () => context.cookies(url);
    async function assertNoOptionalCookies() {
      await page.waitForFunction(() => !document.cookie.split(';').some(c => /^\s*ntnui_(locale|theme)=/.test(c)));
      assert.equal((await readCookies()).filter(c => optionalNames.includes(c.name)).length, 0);
    }
    async function choose(name) {
      await page.getByRole('button', { name, exact: true }).click();
      await page.locator('#cookie-preferences-title').waitFor({ state: 'hidden' });
    }

    // An upgrade must not silently treat legacy preference cookies as consent.
    await context.addCookies([
      { name: 'ntnui_locale', value: 'da', url },
      { name: 'ntnui_theme', value: 'light', url },
    ]);
    await page.goto(`${url}/en/privacy`);
    await page.getByRole('heading', { name: 'Save your preferences?', exact: true }).waitFor();
    await assertNoOptionalCookies();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    await page.screenshot({ path: '.tmp-privacy/desktop-initial.png' });
    await choose('Use without saving');
    assert.equal((await readCookies()).find(c => c.name === 'ntnui_cookie_preferences').value, 'v1.rejected');
    await assertNoOptionalCookies();

    // Rejecting storage keeps ordinary controls and internal navigation usable.
    await page.locator('.app-nav-theme-button').click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.getByRole('link', { name: 'Cookies', exact: true }).first().click();
    await page.getByRole('heading', { name: 'Cookies and your choices', exact: true }).waitFor();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await assertNoOptionalCookies();
    await page.screenshot({ path: '.tmp-privacy/desktop-cookies-light.png' });

    // The footer opens settings with focus, and a decision restores it.
    const footerSettings = page.locator('footer').getByRole('button', { name: 'Cookie settings', exact: true });
    await footerSettings.click();
    assert.equal(await page.locator('#cookie-preferences-title').evaluate(el => el === document.activeElement), true);
    await choose('Save preferences');
    assert.equal(await footerSettings.evaluate(el => el === document.activeElement), true);
    await page.waitForFunction(() => document.cookie.includes('ntnui_theme=light'));
    let cookies = await readCookies();
    assert.equal(cookies.find(c => c.name === 'ntnui_cookie_preferences').value, 'v1.accepted');
    assert.equal(cookies.find(c => c.name === 'ntnui_locale').value, 'en');
    assert.equal(cookies.find(c => c.name === 'ntnui_theme').value, 'light');
    for (const cookie of cookies.filter(c => c.name.startsWith('ntnui_'))) {
      const days = (cookie.expires - Date.now() / 1000) / 86400;
      assert.ok(days > 179 && days <= 180.01);
      assert.equal(cookie.sameSite, 'Lax');
    }
    await page.reload();
    await page.getByRole('heading', { name: 'Cookies and your choices', exact: true }).waitFor();
    assert.equal(await page.locator('#cookie-preferences-title').count(), 0);
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await footerSettings.click();
    await choose('Use without saving');
    await assertNoOptionalCookies();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.reload();
    await page.getByRole('heading', { name: 'Cookies and your choices', exact: true }).waitFor();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    assert.equal(await page.locator('#cookie-preferences-title').count(), 0);

    // Long translations and the settings notice remain usable on a narrow phone.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('header select').selectOption('de');
    await page.waitForURL('**/de/cookies');
    await page.getByRole('heading', { name: copies.de.pages.cookies.title, exact: true }).waitFor();
    await assertNoOptionalCookies();
    await page.locator('footer').getByRole('button', { name: copies.de.cookieSettings, exact: true }).click();
    await page.screenshot({ path: '.tmp-privacy/mobile-settings-de.png' });
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      const box = await page.locator('section[aria-labelledby="cookie-preferences-title"]').boundingBox();
      assert.ok(box.x >= 0 && box.x + box.width <= width);
    }
    await page.locator('section[aria-labelledby="cookie-preferences-title"] button').last().click();
    await page.locator('#cookie-preferences-title').waitFor({ state: 'hidden' });
    await assertNoOptionalCookies();
    await page.goto(`${url}/no/privacy`);
    await page.getByRole('heading', { name: LEGAL_NO.pages.privacy.title, exact: true }).waitFor();
    await page.screenshot({ path: '.tmp-privacy/mobile-privacy-no.png' });

    // Route, metadata and translation coverage for all three policies/eight languages.
    const requests = Object.entries(copies).flatMap(([locale, copy]) => LEGAL_PAGE_SLUGS.map(slug => ({ locale, copy, slug })));
    for (const { locale, copy, slug } of requests) {
      const response = await context.request.get(`${url}/${locale}/${slug}`);
      assert.equal(response.status(), 200, `${locale}/${slug}`);
      const body = await response.text();
      assert.ok(body.includes(`lang="${locale}"`));
      assert.ok(body.includes(copy.pages[slug].title));
      assert.ok(body.includes('mailto:he.ma@ntnui.no'));
      assert.ok(body.includes(`rel="canonical" href="http://localhost:3000/${locale}/${slug}"`));
      assert.equal(new Set(copy.pages[slug].sections.map(section => section.id)).size, copy.pages[slug].sections.length);
    }
    for (const slug of LEGAL_PAGE_SLUGS) {
      const response = await context.request.get(`${url}/${slug}`, { maxRedirects: 0 });
      assert.equal(response.status(), 307);
      assert.equal(response.headers().location, `/no/${slug}`);
    }
    for (const route of ['/xx/privacy', '/constructor/privacy', '/en/not-a-policy']) {
      const response = await context.request.get(`${url}${route}`);
      assert.equal(response.status(), 404, route);
    }
    const sitemap = await (await context.request.get(`${url}/sitemap.xml`)).text();
    for (const { locale, slug } of requests) assert.ok(sitemap.includes(`/${locale}/${slug}`));
    await context.clearCookies();
    await context.addCookies([
      { name: 'ntnui_cookie_preferences', value: 'v0.accepted', url },
      { name: 'ntnui_theme', value: 'light', url },
    ]);
    await page.goto(`${url}/en/privacy`);
    await page.getByRole('heading', { name: 'Save your preferences?', exact: true }).waitFor();
    await assertNoOptionalCookies();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
    await choose('Use without saving');

    // Form notices appear before submission; the external protection itself is not exercised.
    await page.route('**/api/sessions', route => route.fulfill({ json: { sessions: [] } }));
    await page.route('https://challenges.cloudflare.com/**', route => route.abort());
    for (const locale of ['en', 'no']) {
      for (const action of ['register', 'unregister']) {
        await page.goto(`${url}/${locale}/${action}`);
        const form = page.locator('form');
        const notice = form.getByText(copies[locale][`${action}Notice`], { exact: true });
        await notice.waitFor();
        assert.equal(await form.getByRole('link', { name: copies[locale].readPrivacy, exact: true }).getAttribute('href'), `/${locale}/privacy`);
        assert.equal(await form.locator('a[href="https://www.cloudflare.com/turnstile-privacy-policy/"]').count(), 1);
        assert.equal(await notice.evaluate(el => Boolean(el.compareDocumentPosition(el.closest('form').querySelector('button[type="submit"]')) & Node.DOCUMENT_POSITION_FOLLOWING)), true);
      }
    }

    await context.addCookies([
      { name: 'ntnui_cookie_preferences', value: 'v1.accepted', url },
      { name: 'ntnui_locale', value: 'en', url },
    ]);
    for (const route of ['/', '/privacy', '/cookies', '/website-info', '/about', '/faq', '/schedule', '/register', '/unregister', '/room-guide']) {
      const response = await context.request.get(`${url}${route}`, { maxRedirects: 0 });
      assert.equal(response.status(), 307, route);
      assert.equal(response.headers().location, route === '/' ? '/en' : `/en${route}`);
    }
    await page.goto(`${url}/cookies`);
    assert.equal(new URL(page.url()).pathname, '/en/cookies');
    await page.getByRole('heading', { name: LEGAL_EN.pages.cookies.title, exact: true }).waitFor();
    await page.goto(`${url}/no/cookies`);
    assert.equal(await page.locator('html').getAttribute('lang'), 'no');
    await page.waitForFunction(() => document.cookie.includes('ntnui_locale=no'));

    assert.deepEqual(errors, []);
    console.log('PASS: 24 localized pages; consent-aware redirects/404s; metadata/sitemap; legacy-cookie migration; reject/accept/reload/withdrawal; in-session and remembered theme/language; form notices; focus restoration; 390px and 320px layout; no client exceptions.');
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
