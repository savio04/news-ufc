import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("news", function (table) {
    table.string("id").primary();
    table.string("title");
    table.string("date");
    table.string("link");
    table.string("origin");

    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("news");
}
