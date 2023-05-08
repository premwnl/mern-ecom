import mongoose from "mongoose";
import "colors";

const connectDb = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL);
    console.log(
      `connected to MongoDB ${connection.connection.host}`.bgMagenta.white
    );
  } catch (err) {
    console.log(`Error in MongoDB ${err}.bgRed.white`);
  }
};

export default connectDb;
