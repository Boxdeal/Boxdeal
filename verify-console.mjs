import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }
  });
  
  const page = await context.newPage();
  let errorCount = 0;
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('🔴 Console Error:', msg.text());
      errorCount++;
    }
  });
  
  page.on('pageerror', error => {
    console.error('🔴 Page Error:', error.message);
    errorCount++;
  });
  
  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
    
    if (errorCount === 0) {
      console.log('✅ No console or page errors detected');
    } else {
      console.log(`⚠️ ${errorCount} errors detected`);
    }
  } catch (error) {
    console.error('Navigation error:', error.message);
  }
  
  await context.close();
  await browser.close();
})();
