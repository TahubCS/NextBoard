import mongoose from "mongoose";
import dotenv from "dotenv";
import Column from "./models/Column";
import Task from "./models/Task";
import Board from "./models/board"; // <--- Import Board

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("Connected to DB...");

        // 1. Clear EVERYTHING
        await Board.deleteMany({});
        await Column.deleteMany({});
        await Task.deleteMany({});

        // 2. Create Columns
        const col1 = await Column.create({ title: "To Do", taskIds: [] });
        const col2 = await Column.create({ title: "In Progress", taskIds: [] });
        const col3 = await Column.create({ title: "Done", taskIds: [] });

        // 3. Create the Board with the order
        await Board.create({
        columnOrder: [col1._id, col2._id, col3._id]
        });

        console.log("✅ Database seeded with Board structure!");
        process.exit();
    } catch (error) {
        console.error("Error seeding:", error);
        process.exit(1);
    }
};

seedData();