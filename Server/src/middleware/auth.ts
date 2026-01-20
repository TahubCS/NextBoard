import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// We extend the Express Request interface to include our custom property
export interface AuthRequest extends Request {
    user?: { userId: string };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  // 1. Get the token from the header (Authorization: Bearer <token>)
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        // 2. Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
        
        // 3. Attach the user ID to the request object so controllers can use it
        req.user = decoded as { userId: string };
        
        next(); // Move to the next function (the controller)
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
};