import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  page.on('console', msg => console.log('控制台:', msg.text()));
  page.on('pageerror', err => console.log('页面错误:', err.message));
  
  await page.goto('http://localhost:4173');
  await page.waitForLoadState('networkidle');
  
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState('networkidle');
  
  await page.screenshot({ path: 'agent-work/qa-01-start.png', fullPage: true });
  
  // Wait for typing
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'agent-work/qa-02-typed-page1.png', fullPage: true });
  
  // Advance to page 2
  console.log('点击进入第二页...');
  await page.click('.intro-shell');
  await page.waitForTimeout(1000);
  
  // Wait for typing on page 2
  await page.waitForTimeout(6000);
  await page.screenshot({ path: 'agent-work/qa-03-typed-page2.png', fullPage: true });
  
  // Finish intro
  console.log('完成过场...');
  await page.click('.intro-shell');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'agent-work/qa-04-main-menu.png', fullPage: true });
  
  // Verify main menu
  const buttons = await page.$$('.entry-actions button');
  console.log('主菜单按钮数量:', buttons.length);
  
  // Test each button
  console.log('\n=== 测试"关于游戏" ===');
  await page.click('[data-menu-action="about"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'agent-work/qa-05-about.png', fullPage: true });
  console.log('关于页面存在:', !!(await page.$('.document-panel')));
  
  await page.click('.about-back');
  await page.waitForTimeout(1000);
  
  console.log('\n=== 测试"档案" ===');
  await page.click('[data-menu-action="archive"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'agent-work/qa-06-archive.png', fullPage: true });
  console.log('故事侧边栏存在:', !!(await page.$('.story-list')));
  console.log('返回按钮存在:', !!(await page.$('.menu-back')));
  
  await page.click('.menu-back');
  await page.waitForTimeout(1000);
  
  console.log('\n=== 测试"开始新故事" ===');
  await page.click('[data-menu-action="new-story"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'agent-work/qa-07-new-story.png', fullPage: true });
  
  await page.click('[data-story-id="first-academy"]');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'agent-work/qa-08-story-desc.png', fullPage: true });
  
  await page.click('.story-preview');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'agent-work/qa-09-story-desc-done.png', fullPage: true });
  
  console.log('开始按钮存在:', !!(await page.$('[data-start-story]')));
  console.log('继续按钮存在:', !!(await page.$('[data-continue-story]')));
  
  console.log('\n=== 测试开始游戏 ===');
  await page.click('[data-start-story]');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'agent-work/qa-10-game-started.png', fullPage: true });
  
  console.log('文档面板存在:', !!(await page.$('.document-panel')));
  console.log('输入框存在:', !!(await page.$('.command-input-wrap input')));
  
  // Test command input
  console.log('\n=== 测试指令输入 ===');
  await page.fill('.command-input-wrap input', 'help');
  await page.press('.command-input-wrap input', 'Enter');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'agent-work/qa-11-help-output.png', fullPage: true });
  console.log('终端输出存在:', !!(await page.$('.terminal-card')));
  
  // Test doc command
  await page.fill('.command-input-wrap input', 'doc');
  await page.press('.command-input-wrap input', 'Enter');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'agent-work/qa-12-doc-list.png', fullPage: true });
  
  // Test open command
  await page.fill('.command-input-wrap input', 'open sc-001');
  await page.press('.command-input-wrap input', 'Enter');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'agent-work/qa-13-open-doc.png', fullPage: true });
  console.log('文档查看器存在:', !!(await page.$('.document-panel')));
  
  console.log('\n=== QA 测试完成 ===');
  await browser.close();
})();
