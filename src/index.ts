import puppeteer from "puppeteer";
import { LocalAuth } from "whatsapp-web.js";
import QRcode from "qrcode";
import { jobs } from "./jobs";
import schedule from "node-schedule";
import { WhatsappDriver } from "./libs/whatsappDriver";
import { RemoveNews } from "./jobs/remove-news";

(async () => {
  const client = new WhatsappDriver({
    authStrategy: new LocalAuth({ clientId: "my-wpp" }),
    puppeteer: {
      args: ["--no-sandbox"],
    },
  });

  client.on("qr", async (qr) => {
    const qrcode = await QRcode.toDataURL(qr);

    console.log({ qrcode });
  });

  client.on("ready", async () => {
    process.stdout.write("Client wpp is ready\n");

    schedule.scheduleJob(`*/10 * * * *`, async () => {
      process.stdout.write(`Job started\n`);
      const browser = await puppeteer.launch({
        headless: true,
        args: [`--ignore-certificate-errors`, `--no-sandbox`],
      });

      for await (const job of jobs) {
        await job(browser, client);
      }

      await browser.close();
      process.stdout.write(`Job finished\n`);
    });

    /*Remove news from database*/
    const removeNews = new RemoveNews();
    schedule.scheduleJob(`*/10 * * * *`, removeNews.execute.bind(removeNews));
  });

  client.initialize();
})();
