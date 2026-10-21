import app from "./app.js";
import { AppDataSource } from "./src/config/conexion.js";

const PORT = 4500;

app.get("/", (req, res) => {
  res.send("Hello world");
});

try {
  await AppDataSource.initialize();
  console.log("Data Source has been initialized!");
} catch (error) {
  console.error("Error during Data Source initialization", error);
}

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server listening on port ${PORT}`);
  }
});
