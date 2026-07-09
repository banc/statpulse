import { NextFunction, Request, Response } from 'express';
export type AuthContext = {
    userId: string;
    email: string;
};
export type AuthenticatedRequest = Request & {
    auth: AuthContext;
};
export declare function requireAuth(req: Request, _res: Response, next: NextFunction): void;
export declare function getAuthContext(req: Request): AuthContext;
