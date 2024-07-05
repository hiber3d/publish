/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-loop-func */

import { exit } from "process";
import { exec } from "child_process";
import puppeteer from "puppeteer";
import * as fs from "fs";

setTimeout(() => {
  console.log("Error: Watchdog triggered.");
  exit(1);
}, 180000);


const open = async () => {

  const browser = await puppeteer.launch();

  console.log("--- launching " + await browser.version());

  const page = await browser.newPage();

  page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

  page.on("error", (msg) => {
    console.error("Page crashed:", msg);
    browser.close();
    exit(0);
  });

  page.on("pageerror", (msg) => {
    console.error("Uncaught exception in page:", msg);
    browser.close();
    exit(0);
  });

  let retry = 10;

  while (retry) {
    const url = "http://localhost:5173/";
    console.log("Trying " + url);
    await page
      .goto(url)
      .then(() => {
        retry = 0;
      })
      .catch(() => {
        retry--;

        if (!retry) {
          exit(1);
        }

        if(fs.existsSync('scene.json'))
        {
          console.log("scene.json exists, continuing.");
          retry = 0;
        }
        else{
          return new Promise((resolve) => setTimeout(resolve, 3000));
        }
      });
  }
};


(async () => {
  if(fs.existsSync('scene.json'))
  {
    console.log("scene.json exists, cleaning up...");
    exec('rm scene.json');
  }

  await open();
})();
