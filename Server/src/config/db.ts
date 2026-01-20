import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || "");
        console.log(`[database]: MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[database]: Error: ${(error as Error).message}`);
        process.exit(1); // Stop the app if we can't connect to the DB
    }
};

export default connectDB;