import { NextFunction, Request, Response } from 'express';
import { Role } from '../generated/prisma/enums.js';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: Role;
                emailVerified: boolean
            }
        }
    }
}

// Import auth promise dynamically
let betterAuth: any;
const loadAuth = async () => {
    if (!betterAuth) {
        const authModule = await import("../lib/auth.js");
        betterAuth = await authModule.auth;
    }
    return betterAuth;
};

const auth = (...roles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Load auth if not loaded yet
            const authInstance = await loadAuth();
            
            // get user session
            const session = await authInstance.api.getSession({
                headers: req.headers as any
            });
            
            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: "You are not authorized!"
                });
            }
            
            if (!session.user.emailVerified) {
                return res.status(403).json({
                    success: false,
                    message: "Email Verification required. Please verify your email!"
                });
            }
            
            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: session.user.role as Role,
                emailVerified: session.user.emailVerified
            };
            
            if (roles.length && !roles.includes(req.user.role as Role)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden! You don't have permission to access this resource"
                });
            }
            
            next();
        } catch (error) {
            next(error);
        }
    };
};

export default auth;