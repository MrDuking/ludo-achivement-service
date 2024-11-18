import { Injectable } from "@nestjs/common"

const delta = 0x9e3779b9

@Injectable()
export class EncryptService {
    toUint8Array(v: Uint32Array, includeLength: boolean): Uint8Array | null {
        const length = v.length
        let n = length << 2
        if (includeLength) {
            const m = v[length - 1]
            n -= 4
            if (m < n - 3 || m > n) {
                return null
            }
            n = m
        }
        const bytes = new Uint8Array(n)
        for (let i = 0; i < n; ++i) {
            bytes[i] = v[i >> 2] >> ((i & 3) << 3)
        }
        return bytes
    }

    toUint32Array(bytes: Uint8Array, includeLength: boolean): Uint32Array {
        const length = bytes.length
        let n = length >> 2
        if ((length & 3) !== 0) {
            ++n
        }
        let v
        if (includeLength) {
            v = new Uint32Array(n + 1)
            v[n] = length
        } else {
            v = new Uint32Array(n)
        }
        for (let i = 0; i < length; ++i) {
            v[i >> 2] |= bytes[i] << ((i & 3) << 3)
        }
        return v
    }

    mx(sum: number, y: number, z: number, p: number, e: number, k: Uint32Array): number {
        return (((z >>> 5) ^ (y << 2)) + ((y >>> 3) ^ (z << 4))) ^ ((sum ^ y) + (k[(p & 3) ^ e] ^ z))
    }

    fixk(k: Uint8Array): Uint8Array {
        if (k.length < 16) {
            const key = new Uint8Array(16)
            key.set(k)
            k = key
        }
        return k
    }

    encryptUint32Array(v: Uint32Array, k: Uint32Array): Uint32Array {
        const length = v.length
        const n = length - 1
        let y, z, sum, e, p, q
        z = v[n]
        sum = 0
        for (q = Math.floor(6 + 52 / length); q > 0; --q) {
            sum += delta
            e = (sum >>> 2) & 3
            for (p = 0; p < n; ++p) {
                y = v[p + 1]
                z = v[p] += this.mx(sum, y, z, p, e, k)
            }
            y = v[0]
            z = v[n] += this.mx(sum, y, z, p, e, k)
        }
        return v
    }

    decryptUint32Array(v: Uint32Array, k: Uint32Array): Uint32Array {
        const length = v.length
        const n = length - 1
        let y, z, sum, e, p, q
        y = v[0]
        // eslint-disable-next-line
        q = Math.floor(6 + 52 / length)
        for (sum = q * delta; sum !== 0; sum -= delta) {
            e = (sum >>> 2) & 3
            for (p = n; p > 0; --p) {
                z = v[p - 1]
                y = v[p] -= this.mx(sum, y, z, p, e, k)
            }
            z = v[n]
            y = v[0] -= this.mx(sum, y, z, p, e, k)
        }
        return v
    }

    toBytes(str: string): Uint8Array {
        const n = str.length
        const bytes = new Uint8Array(n * 3)
        let length = 0
        for (let i = 0; i < n; i++) {
            const codeUnit = str.charCodeAt(i)
            if (codeUnit < 0x80) {
                bytes[length++] = codeUnit
            } else if (codeUnit < 0x800) {
                bytes[length++] = 0xc0 | (codeUnit >> 6)
                bytes[length++] = 0x80 | (codeUnit & 0x3f)
            } else if (codeUnit < 0xd800 || codeUnit > 0xdfff) {
                bytes[length++] = 0xe0 | (codeUnit >> 12)
                bytes[length++] = 0x80 | ((codeUnit >> 6) & 0x3f)
                bytes[length++] = 0x80 | (codeUnit & 0x3f)
            } else {
                if (i + 1 < n) {
                    const nextCodeUnit = str.charCodeAt(i + 1)
                    if (codeUnit < 0xdc00 && 0xdc00 <= nextCodeUnit && nextCodeUnit <= 0xdfff) {
                        const rune = (((codeUnit & 0x03ff) << 10) | (nextCodeUnit & 0x03ff)) + 0x010000
                        bytes[length++] = 0xf0 | (rune >> 18)
                        bytes[length++] = 0x80 | ((rune >> 12) & 0x3f)
                        bytes[length++] = 0x80 | ((rune >> 6) & 0x3f)
                        bytes[length++] = 0x80 | (rune & 0x3f)
                        i++
                        continue
                    }
                }
                throw new Error("Malformed string")
            }
        }
        return bytes.subarray(0, length)
    }

    encrypt(data: string | Uint8Array, key: string | Uint8Array): Uint8Array | null {
        if (typeof data === "string") data = this.toBytes(data)
        if (typeof key === "string") key = this.toBytes(key)
        if (!data || data.length === 0) {
            return null
        }
        return this.toUint8Array(this.encryptUint32Array(this.toUint32Array(data, true), this.toUint32Array(this.fixk(key), false)), false)
    }

    decrypt(data: string | Uint8Array, key: string | Uint8Array): Uint8Array | null {
        if (typeof data === "string") {
            data = Buffer.from(data, "base64")
        }
        if (typeof key === "string") key = this.toBytes(key)
        if (!data || data.length === 0) {
            return null
        }
        return this.toUint8Array(this.decryptUint32Array(this.toUint32Array(data, false), this.toUint32Array(this.fixk(key), false)), true)
    }

    encryptToString(data: string, key: string): string {
        return Buffer.from(this.encrypt(data, key)!).toString("base64")
    }

    decryptToString(data: string, key: string): string {
        return Buffer.from(this.decrypt(data, key)!).toString()
    }
}
