import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
}

const UserSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // No two users can have the same email
        trim: true,
        lowercase: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;