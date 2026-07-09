type AuthTokenPayload = {
    sub: string;
    email: string;
    exp: number;
};
export declare function issueAuthToken(user: {
    id: string;
    email: string;
}): string;
export declare function verifyAuthToken(token: string): AuthTokenPayload;
export {};
