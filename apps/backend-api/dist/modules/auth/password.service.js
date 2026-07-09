"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
const crypto_1 = require("crypto");
const util_1 = require("util");
const scrypt = (0, util_1.promisify)(crypto_1.scrypt);
const KEY_LENGTH = 64;
async function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString('base64url');
    const derivedKey = (await scrypt(password, salt, KEY_LENGTH));
    return `scrypt$${salt}$${derivedKey.toString('base64url')}`;
}
async function verifyPassword(password, passwordHash) {
    const [algorithm, salt, storedKey] = passwordHash.split('$');
    if (algorithm !== 'scrypt' || !salt || !storedKey) {
        return false;
    }
    const storedBuffer = Buffer.from(storedKey, 'base64url');
    const derivedKey = (await scrypt(password, salt, storedBuffer.length));
    return storedBuffer.length === derivedKey.length && (0, crypto_1.timingSafeEqual)(storedBuffer, derivedKey);
}
//# sourceMappingURL=password.service.js.map