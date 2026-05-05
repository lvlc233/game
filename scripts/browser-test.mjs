import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  await page.goto('http://localhost:4173');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'agent-work/initial-page.png', fullPage: true });
  
  console.log('Screenshot saved to agent-work/initial-page.png');
  
  // Get page content
  const content = await page.content();
  console.log('Page title:', await page.title());
  
  // Check for key elements
  const hasStory = await page.$('tw-story');
  const hasPassages = await page.$('#passages');
  const hasInput = await page.$('input[type="text"]');
  
  console.log('Has story element:', !!hasStory);
  console.log('Has passages container:', !!hasPassages);
  console.log('Has text input:', !!hasInput);
  
  await browser.close();
})();
