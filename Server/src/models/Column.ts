import mongoose, { Document, Schema } from "mongoose";

// 1. The Interface
export interface IColumn extends Document {
    title: string;
    taskIds: mongoose.Types.ObjectId[]; // An array of IDs pointing to Tasks
}

// 2. The Schema
const ColumnSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
    },
    // This array stores the ORDER of the tasks.
    // Example: ["id_of_task_A", "id_of_task_B", "id_of_task_C"]
    taskIds: [
        {
        type: Schema.Types.ObjectId,
        ref: "Task", // Connects this ID to the Task model we just made
        },
    ],
});

const Column = mongoose.model<IColumn>("Column", ColumnSchema);
export default Column;