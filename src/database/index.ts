import knexSetup from "knex";
import knexConfig from "../../knexfile";

export const knex = knexSetup(knexConfig);
