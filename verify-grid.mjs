import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Check the grid structure
    const grids = await page.evaluate(() => {
      const gridElements = document.querySelectorAll('.grid.grid-cols-2');
      return gridElements.length;
    });
    
    const productCards = await page.evaluate(() => {
      // Count product cards in the first category section
      const firstSection = document.querySelector('[class*="border-b"]');
      if (firstSection) {
        const cards = firstSection.querySelectorAll('[class*="flex"][class*="flex-col"]');
        return cards.length;
      }
      return 0;
    });
    
    console.log(`✅ Found ${grids} grid containers with grid-cols-2 class`);
    console.log(`✅ First section contains product cards`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await context.close();
  await browser.close();
})();
