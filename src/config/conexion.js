import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.HOST_DB,
  port: process.env.PORT_DB,
  username: process.env.USERNAME_DB,
  password: process.env.PWD_DB,
  database: process.env.DATABASE,
});
