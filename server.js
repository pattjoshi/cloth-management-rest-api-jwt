import express from "express";
import { MONGO_URL, PORT } from "./config";
const app = express();
import mongoose from "mongoose";
import routers from "./routes";
import errorHandler from "./middlewares/errorHandler";
import path from "path";
import cors from "cors";

const PORT_URL = process.env.PORT_URL || PORT;
// connect to mongodb
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err.message);
  });

global.appRoot = path.resolve(__dirname);
app.use(cors()); // recive multipart data
app.use(express.urlencoded({ extended: false }));
// middleware
app.use(express.json());
app.use("/api", routers);
app.use("/uploads", express.static("uploads"));

// error handler
app.use(errorHandler);
app.listen(PORT_URL, () => {
  console.log(`Server is running on port ${PORT}`);
});
