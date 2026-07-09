"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsafeUrlError = void 0;
exports.normalizeHttpUrl = normalizeHttpUrl;
exports.assertSafeHttpUrl = assertSafeHttpUrl;
exports.safeFetch = safeFetch;
const promises_1 = require("dns/promises");
const net_1 = require("net");
const MAX_REDIRECTS = 5;
const MAX_RESPONSE_BYTES = 1024 * 1024;
const LOCAL_HOSTNAMES = new Set(['localhost', 'localhost.localdomain']);
class UnsafeUrlError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnsafeUrlError';
    }
}
exports.UnsafeUrlError = UnsafeUrlError;
function normalizeHttpUrl(value) {
    let url;
    try {
        url = new URL(value.trim());
    }
    catch {
        throw new UnsafeUrlError('URL must be valid');
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new UnsafeUrlError('Only HTTP and HTTPS URLs are supported');
    }
    if (!url.hostname) {
        throw new UnsafeUrlError('URL hostname is required');
    }
    if (url.username || url.password) {
        throw new UnsafeUrlError('URL credentials are not allowed');
    }
    url.hash = '';
    return url.toString();
}
async function assertSafeHttpUrl(value) {
    const normalizedUrl = normalizeHttpUrl(value);
    await assertPublicHostname(new URL(normalizedUrl).hostname);
    return normalizedUrl;
}
async function safeFetch(value, options) {
    let currentUrl = new URL(await assertSafeHttpUrl(value));
    for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
        const response = await fetch(currentUrl, {
            method: options.method,
            signal: options.signal,
            headers: options.headers,
            redirect: 'manual',
        });
        await drainResponseBody(response, options.method);
        if (!isRedirectStatus(response.status)) {
            return {
                status: response.status,
                url: currentUrl.toString(),
            };
        }
        const location = response.headers.get('location');
        if (!location) {
            return {
                status: response.status,
                url: currentUrl.toString(),
            };
        }
        if (redirectCount === MAX_REDIRECTS) {
            throw new UnsafeUrlError('Too many redirects');
        }
        currentUrl = new URL(await assertSafeHttpUrl(new URL(location, currentUrl).toString()));
    }
    throw new UnsafeUrlError('Too many redirects');
}
async function assertPublicHostname(hostname) {
    const normalizedHostname = hostname.toLowerCase().replace(/^\[(.*)\]$/, '$1');
    if (LOCAL_HOSTNAMES.has(normalizedHostname) ||
        normalizedHostname.endsWith('.localhost') ||
        normalizedHostname.endsWith('.local')) {
        throw new UnsafeUrlError('Local hostnames are not allowed');
    }
    const ipVersion = (0, net_1.isIP)(normalizedHostname);
    if (ipVersion !== 0) {
        assertPublicIp(normalizedHostname);
        return;
    }
    const records = await (0, promises_1.lookup)(normalizedHostname, { all: true, verbatim: true });
    if (records.length === 0) {
        throw new UnsafeUrlError('Hostname did not resolve');
    }
    for (const record of records) {
        assertPublicIp(record.address);
    }
}
function assertPublicIp(address) {
    if (isBlockedIp(address)) {
        throw new UnsafeUrlError('Private, local, or reserved network addresses are not allowed');
    }
}
function isBlockedIp(address) {
    const ipVersion = (0, net_1.isIP)(address);
    if (ipVersion === 4) {
        return isBlockedIpv4(address);
    }
    if (ipVersion === 6) {
        return isBlockedIpv6(address);
    }
    return true;
}
function isBlockedIpv4(address) {
    const [a = 0, b = 0, c = 0, d = 0] = address.split('.').map(Number);
    return (a === 0 ||
        a === 10 ||
        a === 127 ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 0 && c === 0) ||
        (a === 192 && b === 0 && c === 2) ||
        (a === 192 && b === 168) ||
        (a === 198 && (b === 18 || b === 19)) ||
        (a === 198 && b === 51 && c === 100) ||
        (a === 203 && b === 0 && c === 113) ||
        a >= 224 ||
        (a === 255 && b === 255 && c === 255 && d === 255));
}
function isBlockedIpv6(address) {
    const lowerAddress = address.toLowerCase();
    const normalizedAddress = lowerAddress.split('%')[0];
    if (normalizedAddress.startsWith('::ffff:')) {
        const mappedIpv4 = normalizedAddress.slice('::ffff:'.length);
        if ((0, net_1.isIP)(mappedIpv4) === 4) {
            return isBlockedIpv4(mappedIpv4);
        }
        return true;
    }
    const firstSegment = normalizedAddress.split(':')[0] || '0';
    const firstWord = Number.parseInt(firstSegment, 16);
    return (normalizedAddress === '::' ||
        normalizedAddress === '::1' ||
        normalizedAddress.startsWith('2001:db8:') ||
        (firstWord >= 0xfc00 && firstWord <= 0xfdff) ||
        (firstWord >= 0xfe80 && firstWord <= 0xfebf) ||
        (firstWord >= 0xff00 && firstWord <= 0xffff));
}
function isRedirectStatus(status) {
    return status === 301 || status === 302 || status === 303 || status === 307 || status === 308;
}
async function drainResponseBody(response, method) {
    if (method === 'HEAD' || !response.body) {
        return;
    }
    const reader = response.body.getReader();
    let bytesRead = 0;
    try {
        while (bytesRead <= MAX_RESPONSE_BYTES) {
            const { done, value } = await reader.read();
            if (done) {
                return;
            }
            bytesRead += value.byteLength;
        }
        throw new UnsafeUrlError('Response body is too large');
    }
    finally {
        reader.releaseLock();
        await response.body.cancel().catch(() => undefined);
    }
}
//# sourceMappingURL=index.js.map