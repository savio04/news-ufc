import { Browser } from "puppeteer";
import { knex } from "../database";
import { MAX_NEWS, Origins, groupId } from "../utils/constants";
import { IMapMessages, mapMessages } from "../utils/mapMessages";
import { WhatsappDriver } from "../libs/whatsappDriver";

export class JobUfcDotBr {
  constructor(
    private browser: Browser,
    private client: WhatsappDriver,
  ) {}

  async execute(url: string) {
    const page = await this.browser.newPage();
    await page.goto(url);

    let newsElements = await page.$$(".listras > .item");
    newsElements = newsElements.slice(0, MAX_NEWS);

    const newsMapped = [];

    for await (const newsElement of newsElements) {
      const { title, link, id, date } = await page.evaluate((element) => {
        const tagA = element.querySelector(".list-title")?.querySelector("a");

        const title = tagA?.textContent;
        const link = `https://www.ufc.br/${tagA?.getAttribute("href")}`;
        const id = link;
        const date = element?.querySelector(".list-date")?.textContent;

        return { title, link, date, id };
      }, newsElement);

      newsMapped.push({
        title,
        link,
        date,
        id,
        origin: Origins.UFC_BR,
      });
    }

    const ids = newsMapped.map((item) => item.id);
    const news = await knex("news")
      .whereIn("id", ids as string[])
      .orderBy("created_at", "desc");

    const newNews = newsMapped.filter(
      (item) => !news.find((ns) => ns.id === item.id),
    );

    if (newNews.length) {
      await knex("news").insert(newNews);

      const messages = mapMessages(Origins.UFC_BR, newNews as IMapMessages[]);

      await this.client.sendMessages(groupId, messages);

      const updatedNews = await knex("news")
        .where({ origin: Origins.UFC_BR })
        .orderBy("created_at", "asc");

      if (updatedNews.length > MAX_NEWS) {
        const removeSize = updatedNews.length - MAX_NEWS;
        const removeItems = updatedNews.slice(0, removeSize);

        if (removeItems.length) {
          await knex("news")
            .whereIn(
              "id",
              removeItems.map((item) => item.id),
            )
            .del();
        }
      }
    }

    await page.close();
  }
}
