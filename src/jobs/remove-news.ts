import { knex } from "../database";
import { MAX_NEWS } from "../utils/constants";

export class RemoveNews {
  async execute() {
    const newsUfc = await knex("news")
      .orderBy("created_at", "desc")
      .select("*");

    const hashMap = new Map();

    for (const newUfc of newsUfc) {
      const key = newUfc.origin;

      if (hashMap.has(key)) {
        const current = hashMap.get(key);
        current.push(newUfc);

        hashMap.set(key, current);
      } else {
        hashMap.set(key, [newUfc]);
      }
    }

    for await (const [_, news] of hashMap.entries()) {
      if (news.length <= MAX_NEWS) continue;

      const removeSize = news.length - MAX_NEWS;

      const removedItems = news.splice(0, removeSize);

      if (removedItems?.length > 0) {
        await knex("news").whereIn(
          "id",
          removedItems.map((item: any) => item.id),
        );
      }
    }
  }
}
