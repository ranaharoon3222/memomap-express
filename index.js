import express from 'express';

import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import 'dotenv/config';

const app = express();
const port = 3000;

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const url = 'https://memomap-app.myshopify.com/admin/api/2024-01/products.json';

app.get('/', async (req, res) => {
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();

  // // Navigate the page to a URL
  // await page.goto('http://127.0.0.1:5500/');

  // // Set screen size
  // await page.setViewport({
  //   width: 1920,
  //   height: 1080,
  //   deviceScaleFactor: 5.5,
  // });

  // await page.reload();

  // await page.waitForSelector('.map-container');

  // await sleep(1000);

  // async function screenshotDOMElement(selector, padding = 0) {
  //   const rect = await page.evaluate((selector) => {
  //     const element = document.querySelector(selector);

  //     const { x, y, width, height } = element.getBoundingClientRect();
  //     return { left: x, top: y, width, height, id: element.id };
  //   }, selector);

  //   return await page.screenshot({
  //     path: 'element.png',
  //     encoding: 'base64',
  //     clip: {
  //       x: rect.left - padding,
  //       y: rect.top - padding,
  //       width: rect.width + padding * 2,
  //       height: rect.height + padding * 2,
  //     },
  //   });
  // }

  // const base64 = await screenshotDOMElement('.map-container', 25);

  // await browser.close();

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
