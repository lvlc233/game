import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  page.on('console', msg => console.log('控制台:', msg.text()));
  page.on('pageerror', err => console.log('错误:', err.message));
  
  await page.goto('http://localhost:4173');
  await page.waitForLoadState('networkidle');
  
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
  
  await page.screenshot({ path: 'agent-work/debug-01-start.png', fullPage: true });
  
  // Wait for typing to complete
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'agent-work/debug-02-typed.png', fullPage: true });
  
  // First click - should finish typing
  console.log('第一次点击（完成打字）...');
  await page.click('.intro-shell');
  await page.waitForTimeout(1000);
  
  // Second click - should advance to menu
  console.log('第二次点击（进入菜单）...');
  await page.click('.intro-shell');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'agent-work/debug-03-after-clicks.png', fullPage: true });
  
  // Check what we have
  const html = await page.$eval('#app-root', el => el.innerHTML);
  console.log('app-root 内容长度:', html.length);
  console.log('包含 entry-panel:', html.includes('entry-panel'));
  console.log('包含 intro-shell:', html.includes('intro-shell'));
  console.log('包含 entry-actions:', html.includes('entry-actions'));
  
  // Try to manually navigate
  console.log('尝试手动导航到 Game...');
  await page.evaluate(() => {
    setup.finishIntro();
    Engine.play('Game');
  });
  await page.waitForTimeout(1500);
  
  await page.screenshot({ path: 'agent-work/debug-04-manual-nav.png', fullPage: true });
  
  const html2 = await page.$eval('#app-root', el => el.innerHTML);
  console.log('手动导航后包含 entry-panel:', html2.includes('entry-panel'));
  console.log('手动导航后包含 entry-actions:', html2.includes('entry-actions'));
  
  if (html2.includes('entry-actions')) {
    const buttons = await page.$$('.entry-actions button');
    console.log('按钮数量:', buttons.length);
  }
  
  await browser.close();
})();
