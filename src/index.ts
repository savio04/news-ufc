import puppeteer from "puppeteer";
import { LocalAuth } from "whatsapp-web.js";
import QRcode from "qrcode";
import { jobs } from "./jobs";
import schedule from "node-schedule";
import { WhatsappDriver } from "./libs/whatsappDriver";
import { RemoveNews } from "./jobs/remove-news";
import express from "express";
import cors from "cors";
import qrcodeTerminal from "qrcode-terminal";

const app = express();

app.use(express.json());
app.use(cors());

app.use((_, response) => {
  return response.status(404).end();
});

app.use("/health", (_, response) => {
  return response.status(200).json({ status: 200 });
});

app.listen(3001, () => {
  process.stdout.write("Api is running 3001\n");
});

(async () => {
  const client = new WhatsappDriver({
    authStrategy: new LocalAuth({ clientId: "my-wpp" }),
    puppeteer: {
      args: ["--no-sandbox"],
    },
  });

  client.on("qr", async (qr) => {
    const qrcode = await QRcode.toDataURL(qr);

    qrcodeTerminal.generate(qr, { small: true });

    console.log(qrcode);
  });

  client.on("ready", async () => {
    process.stdout.write("Client wpp is ready\n");

    schedule.scheduleJob(`*/10 * * * *`, async () => {
      process.stdout.write(`Job started\n`);
      const browser = await puppeteer.launch({
        ignoreDefaultArgs: ["--disable-extensions"],
        args: ["--no-sandbox", "--use-gl=egl", "--disable-setuid-sandbox"],
        ignoreHTTPSErrors: true,
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
