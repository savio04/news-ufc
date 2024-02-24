const config = {
  client: "sqlite3",
  connection: {
    filename: "./src/database/db.sqlite",
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./src/database/migrations",
  },
};

export default config;
