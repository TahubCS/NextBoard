import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

// 1. REGISTER - NOW RETURNS TOKEN TO AUTO-LOGIN
export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user with name
        const newUser = await User.create({ 
            name,
            email, 
            passwordHash 
        });

        // Generate JWT token for automatic login
        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET || "default_secret",
            { expiresIn: "7d" }
        );

        // Return token, email, and name so frontend can auto-login
        res.status(201).json({ 
            message: "User created successfully",
            token,
            email: newUser.email,
            name: newUser.name
        });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};

// 2. LOGIN
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || "default_secret",
            { expiresIn: "7d" }
        );

        res.status(200).json({ 
            token, 
            email: user.email,
            name: user.name
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};