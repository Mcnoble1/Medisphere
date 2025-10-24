import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();
let mongoServer;

export const connectDB = async () => {
  try {
      await mongoose.connect(process.env.MONGO_URI, {
        dbName: "medisphere",
      });
      mongoose.set('debug', true);
      console.log("Connected to MongoDB");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    if (mongoServer) {
      await mongoServer.stop(); // Ensure `stop()` is only called if it exists
    }
  } catch (error) {
    console.error(`Error disconnecting from DB: ${error.message}`);
  }
};

export default connectDB;
