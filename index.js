import express from 'express';
import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import 'dotenv/config';
import cors from 'cors';
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// import { executablePath } from 'puppeteer';

// puppeteer.use(StealthPlugin());

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const url = 'https://4b988e.myshopify.com/admin/api/2024-01/products.json';

app.get('/', async (req, res) => {
  res.send('Hello World!');
});

app.get('/screenshot', async (req, res) => {
  const decode = decodeURIComponent(req.query.url);
  const link = new URL(decode);
  const mapTitle = link.searchParams.get('mapTitle');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  try {
    const page = await browser.newPage();

    page.setDefaultTimeout(50000);

    // Navigate the page to a URL
    await page.goto(decode, {
      waitUntil: 'load',
      timeout: 0,
    });
    // Set screen size
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 5.5,
    });

    await page.waitForSelector('.map-container', {
      timeout: 0,
    });

    await page.waitForNetworkIdle();

    await page.reload();

    async function screenshotDOMElement(selector, padding = 0) {
      const rect = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        document.querySelector('.map_actions').style.display = 'none';
        const { x, y, width, height } = element.getBoundingClientRect();
        return { left: x, top: y, width, height, id: element.id };
      }, selector);

      await sleep(9000);

      return await page.screenshot({
        path: 'element.png',
        encoding: 'base64',
        optimizeForSpeed: true,
        clip: {
          x: rect.left - padding,
          y: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        },
      });
    }
    const base64 = await screenshotDOMElement('.map-container', 55);

    console.log(base64.substring(1, 50));

    await page.close();

    const resp = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        product: {
          title: mapTitle !== null ? mapTitle : 'MEINE REISE',
          variants: [{ option1: 'map', price: 85.84, compare_at_price: 95.84 }],
          images: [
            {
              attachment: base64,
            },
          ],
        },
      }),
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    const data = await resp.json();
    const product = data.product;

    res.status(200).send(product);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      error,
    });
  } finally {
    await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
