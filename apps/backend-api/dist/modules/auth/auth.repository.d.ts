export declare function findUserByEmail(email: string): import("@statpulse/database/dist/prisma/generated/client/models").Prisma__UserClient<{
    email: string;
    id: string;
    passwordHash: string;
    createdAt: Date;
} | null, null, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function findUserById(id: string): import("@statpulse/database/dist/prisma/generated/client/models").Prisma__UserClient<{
    email: string;
    id: string;
    createdAt: Date;
} | null, null, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
export declare function createUser(data: {
    email: string;
    passwordHash: string;
}): import("@statpulse/database/dist/prisma/generated/client/models").Prisma__UserClient<{
    email: string;
    id: string;
    createdAt: Date;
}, never, import("@prisma/client/runtime/client").DefaultArgs, {
    omit: import("@statpulse/database/dist/prisma/generated/client/internal/prismaNamespace").GlobalOmitConfig | undefined;
}>;
