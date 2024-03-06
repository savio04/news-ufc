declare module "knex/types/tables" {
  interface Tables {
    news: {
      title: string;
      link: string;
      date: string;
      id: string;
      origin: string;
    };
  }
}
