import mongoose, { Document, Schema } from "mongoose";

export interface IBoard extends Document {
    user: mongoose.Types.ObjectId; // <--- The Owner Stamp
    title: string;                 // <--- Boards need names now (for the dashboard)
    columnOrder: mongoose.Types.ObjectId[];
    background: string;            // <--- Background style for the board
}

const BoardSchema: Schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true, // Every board MUST have an owner
    },
    title: {
        type: String,
        default: "My Project Board",
    },
    columnOrder: [
        {
            type: Schema.Types.ObjectId,
            ref: "Column",
        },
    ],
    background: {
        type: String, 
        default: "", // Empty string - uses CSS theme background
    },
});

const Board = mongoose.model<IBoard>("Board", BoardSchema);
export default Board;