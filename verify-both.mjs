import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  
  // Mobile
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 }
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 2000));
  await mobilePage.screenshot({ path: '/tmp/mobile-final.png', fullPage: true });
  console.log('✅ Mobile screenshot');
  
  // Desktop
  const desktopContext = await browser.newContext({
    viewport: { width: 1024, height: 768 }
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
  await new Promise(resolve => setTimeout(resolve, 2000));
  await desktopPage.screenshot({ path: '/tmp/desktop-final.png', fullPage: true });
  console.log('✅ Desktop screenshot');
  
  await mobileContext.close();
  await desktopContext.close();
  await browser.close();
})();
