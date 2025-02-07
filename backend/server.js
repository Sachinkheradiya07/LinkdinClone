import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postRoute from "./routes/postRouter.js";
import userRoute from "./routes/user.router.js";

const app = express();
dotenv.config();
const port = 8080;
const dbUrl = process.env.ATLASDB_URL;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(postRoute);
app.use(userRoute);

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((e) => {
    console.log(e);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.listen(port, () => {
  console.log(`app listing port ${port}`);
});
