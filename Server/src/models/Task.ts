import mongoose, { Document, Schema } from "mongoose";

export interface ITask extends Document {
    content: string;
    description?: string; // <--- New
    priority: "Low" | "Medium" | "High"; // <--- New
    dueDate?: Date; // <--- New
}

const TaskSchema: Schema = new Schema({
    content: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Low",
    },
    dueDate: {
        type: Date,
        default: null,
    },
});

const Task = mongoose.model<ITask>("Task", TaskSchema);
export default Task;