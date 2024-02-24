import puppeteer from "puppeteer";
import { LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { jobs } from "./jobs";
import schedule from "node-schedule";
import { WhatsappDriver } from "./libs/whatsappDriver";

(async () => {
  const client = new WhatsappDriver({
    authStrategy: new LocalAuth({ clientId: "my-wpp" }),
  });

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", async () => {
    process.stdout.write("Client wpp is ready\n");

    schedule.scheduleJob(`*/1 * * * *`, async () => {
      process.stdout.write(`[${new Date()}]: Job started\n`);
      const browser = await puppeteer.launch({ headless: true });

      for await (const job of jobs) {
        await job(browser, client);
      }

      await browser.close();
      process.stdout.write(`[${new Date()}]: Job finished\n`);
    });
  });

  client.initialize();
})();
