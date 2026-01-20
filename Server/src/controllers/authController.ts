import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

// 1. REGISTER
export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body; // <--- Extract name

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user with Name
        const newUser = await User.create({ 
        name, // <--- Save it
        email, 
        passwordHash 
        });

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};

// 2. LOGIN
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "1d" }
        );

        // Return the name too!
        res.status(200).json({ 
        token, 
        email: user.email,
        name: user.name // <--- Send it to frontend
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};