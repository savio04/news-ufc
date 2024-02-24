import { Browser } from "puppeteer";
import { knex } from "../database";
import { MAX_NEWS, Origins, groupId } from "../utils/constants";
import { IMapMessages, mapMessages } from "../utils/mapMessages";
import { WhatsappDriver } from "../libs/whatsappDriver";

export class JobUfcSobral {
  constructor(
    private browser: Browser,
    private client: WhatsappDriver,
  ) {}

  async execute(url: string) {
    const page = await this.browser.newPage();
    await page.goto(url);

    let newsElements = await page.$$(".article-wrapper");
    newsElements = newsElements.slice(0, MAX_NEWS);

    const newsMapped = [];

    for await (const newsElement of newsElements) {
      const { title, link, date, id } = await page.evaluate((element) => {
        const title = element.querySelector(".entry-title")?.querySelector("a")
          ?.textContent;

        const link = element
          .querySelector(".entry-title")
          ?.querySelector("a")
          ?.getAttribute("href");

        const id = element.querySelector("article")?.getAttribute("id");

        const date = element
          .querySelector("article > .entry-header")
          ?.querySelector("span")
          ?.querySelector("a")
          ?.querySelector("time")?.textContent;

        return { title, link, date, id };
      }, newsElement);

      newsMapped.push({
        title,
        link,
        date,
        id,
        origin: Origins.UFC_SOBRAL,
      });
    }

    const ids = newsMapped.map((item) => item.id);
    const news = await knex("news")
      .whereIn("id", ids as string[])
      .orderBy("date", "desc");

    const newNews = newsMapped.filter(
      (item) => !news.find((ns) => ns.id === item.id),
    );

    if (newNews.length) {
      await knex("news").insert(newNews);

      const messages = mapMessages(
        Origins.UFC_SOBRAL,
        newNews as IMapMessages[],
      );

      await this.client.sendMessages(groupId, messages);

      const updatedNews = await knex("news")
        .where({ origin: Origins.UFC_SOBRAL })
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
