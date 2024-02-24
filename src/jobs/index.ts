import { Browser } from "puppeteer";
import { JobUfcSobral } from "./ufc-sobral";
import { WhatsappDriver } from "../libs/whatsappDriver";
import { JobUfcDotBr } from "./ufc-br";

export const jobs = new Set([
  async (browser: Browser, client: WhatsappDriver) => {
    const jobUfcSobral = new JobUfcSobral(browser, client);

    await jobUfcSobral.execute(
      `https://sobral.ufc.br/${new Date().getFullYear()}`,
    );
  },
  async (browser: Browser, client: WhatsappDriver) => {
    const jobUfcDotBr = new JobUfcDotBr(browser, client);

    await jobUfcDotBr.execute(`https://www.ufc.br/noticias`);
  },
]);
