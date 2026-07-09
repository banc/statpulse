export declare function registerUser(input: {
    email: unknown;
    password: unknown;
}): Promise<{
    user: {
        id: string;
        email: string;
        createdAt: Date;
    };
    token: string;
}>;
export declare function loginUser(input: {
    email: unknown;
    password: unknown;
}): Promise<{
    user: {
        id: string;
        email: string;
        createdAt: Date;
    };
    token: string;
}>;
export declare function getCurrentUser(userId: string): Promise<{
    email: string;
    id: string;
    createdAt: Date;
}>;
