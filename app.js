import express from "express";
import router from "./src/routes/index.routes.js";

const PATH_ROUTES = "/api/v1";

const app = express();
app.use(express.json());
app.use(PATH_ROUTES, router);

export default app;
