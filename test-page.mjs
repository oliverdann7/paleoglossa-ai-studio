import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on('pageerror', err => {
  console.log('PAGE ERROR:', err.message);
});

page.on('console', msg => {
  console.log('CONSOLE [' + msg.type() + ']:', msg.text());
});

// Step 1: Load landing page
console.log('--- Step 1: Load landing page ---');
await page.goto('https://paleoglossa-ai-studio.vercel.app/', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
console.log('Title:', await page.title());

const html1 = await page.content();
if (html1.includes('Something went wrong')) {
  console.log('ERROR BOUNDARY on landing page');
  const errorText = await page.evaluate(() => {
    const p = document.querySelector('.card p');
    return p ? p.textContent : 'no error text';
  });
  console.log('Error text:', errorText);
} else {
  console.log('Landing page loaded OK');
}

// Step 2: Click demo mode (Try Demo button)
console.log('\n--- Step 2: Click demo mode ---');
const demoButton = await page.locator('button:has-text("Try Demo")');
if (await demoButton.isVisible()) {
  await demoButton.click();
  await page.waitForTimeout(5000);
  console.log('URL after demo click:', page.url());
  
  const html2 = await page.content();
  if (html2.includes('Something went wrong')) {
    console.log('ERROR BOUNDARY after demo click');
    const errorText = await page.evaluate(() => {
      const p = document.querySelector('.card p');
      return p ? p.textContent : 'no error text';
    });
    console.log('Error text:', errorText);
  } else {
    console.log('Dashboard loaded OK after demo click');
  }
}

await browser.close();
