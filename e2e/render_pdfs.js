// Рендер сгенерированных HTML в PDF (A4) через Playwright. Запуск из e2e/.
const { chromium } = require('@playwright/test');
const path = require('path');
const BUILD = path.resolve(__dirname, '..', 'tools', '_pdfbuild');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const name of ['spisok', 'rasp']) {
    await page.goto('file://' + path.join(BUILD, name + '.html'), { waitUntil: 'networkidle' });
    await page.pdf({
      path: path.join(BUILD, name + '.pdf'),
      format: 'A4', printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' }
    });
    console.log('PDF:', name + '.pdf');
  }
  await browser.close();
})();
