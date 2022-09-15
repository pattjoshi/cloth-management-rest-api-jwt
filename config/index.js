import dotenv from "dotenv";
dotenv.config();

export const {
  PORT,
  MONGO_URL,
  DEBUG_MODE,
  JWT_SECRET,
  REFRESH_SECRET,
  APP_URL,
} = process.env;
