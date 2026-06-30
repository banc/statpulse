export declare function ensureDevUser(): Promise<{
    id: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
}>;
