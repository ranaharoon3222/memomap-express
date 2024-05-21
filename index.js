import express from 'express';

import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import 'dotenv/config';

const app = express();
const port = 3000;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const url = 'https://memomap-app.myshopify.com/admin/api/2024-01/products.json';

app.get('/', async (req, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(
    'http://127.0.0.1:5500/index.html?cities=%5B%7B%22id%22%3A0%2C%22type%22%3A%22text%22%2C%22title%22%3A%22Start%22%2C%22value%22%3A%22Lahore%2C+Punjab%2C+Pakistan%22%2C%22name%22%3A%22Lahore%22%2C%22coordinates%22%3A%5B74.35874729999999%2C31.5203696%5D%2C%22profile%22%3A%22driving%22%2C%22labelPosition%22%3A%22bottom%22%2C%22autoSuggestions%22%3A%5B%5D%7D%2C%7B%22id%22%3A1%2C%22type%22%3A%22text%22%2C%22title%22%3A%22Station%22%2C%22value%22%3A%22Faisalabad%2C+Punjab%2C+Pakistan%22%2C%22name%22%3A%22Faisalabad%22%2C%22coordinates%22%3A%5B73.13496049999999%2C31.45036619999999%5D%2C%22profile%22%3A%22driving%22%2C%22labelPosition%22%3A%22right%22%2C%22autoSuggestions%22%3A%5B%5D%7D%2C%7B%22id%22%3A3%2C%22type%22%3A%22text%22%2C%22title%22%3A%22Station+2%22%2C%22value%22%3A%22Peschawar%2C+Bezirk+Peshawar%2C+Khyber+Pakhtunkhwa%2C+Pakistan%22%2C%22coordinates%22%3A%5B71.5249154%2C34.0151366%5D%2C%22profile%22%3A%22driving%22%2C%22labelPosition%22%3A%22top%22%2C%22autoSuggestions%22%3A%5B%5D%2C%22name%22%3A%22Peschawar%22%7D%2C%7B%22id%22%3A2%2C%22type%22%3A%22text%22%2C%22title%22%3A%22Station+3%22%2C%22value%22%3A%22%22%2C%22coordinates%22%3Anull%2C%22profile%22%3A%22driving%22%2C%22labelPosition%22%3A%22top%22%7D%5D&alignment=Vertikle&layout=love&size=40x50&cardStyle=love&farblook=main_click_blue&mapStyle=mapbox%253A%252F%252Fstyles%252Fmemomap%252Fcln3lxvng035j01qu7qna6auo&mapColor=%252320ac37&mapTitle=testse&tripDetail_1=tset&tripDetail_2=great&rehmen=Rahmen_Holz'
  );

  // Set screen size
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 5.5,
  });

  await page.reload();

  await page.waitForSelector('.map-container');

  await sleep(2000);

  async function screenshotDOMElement(selector, padding = 0) {
    const rect = await page.evaluate((selector) => {
      const element = document.querySelector(selector);

      const { x, y, width, height } = element.getBoundingClientRect();
      return { left: x, top: y, width, height, id: element.id };
    }, selector);

    return await page.screenshot({
      path: 'element.png',
      encoding: 'base64',
      clip: {
        x: rect.left - padding,
        y: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      },
    });
  }

  const base64 = await screenshotDOMElement('.map-container', 25);

  await browser.close();

  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
    },
  });

  const data = await resp.json();
  const products = data.products;

  res.send(products);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
