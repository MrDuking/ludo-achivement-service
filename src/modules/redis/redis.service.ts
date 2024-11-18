import { Inject, Injectable } from "@nestjs/common"
import { ConfigType } from "@nestjs/config"
import { Redis } from "ioredis"
import { RedisConfig } from "src/configs"

@Injectable()
export class RedisService {
    private redis: Redis

    constructor(
        @Inject(RedisConfig.KEY)
        private readonly redisConfig: ConfigType<typeof RedisConfig>
    ) {
        this.redis = new Redis(this.redisConfig.url)
    }

    /**
     * config.ttl: number format in seconds
     */
    async set<T = any>(key: string, object: T | undefined | null, config?: { ttl?: number }) {
        if (config?.ttl) {
            await this.redis.set(key, JSON.stringify(object), "EX", config.ttl)
        } else {
            await this.redis.set(key, JSON.stringify(object))
        }
    }

    async get<T = any>(key: string, defaultValue?: T): Promise<T | undefined | null> {
        const data = await this.redis.get(key)
        return data ? (JSON.parse(data) as T) : defaultValue
    }

    async del(key: string): Promise<boolean> {
        const res = await this.redis.del(key)
        return res == 1
    }

    async iget<T = any, Z extends string | number = string | number>(
        key: string,
        id: Z,
        defaultValue?: T,
        config: { hasTTL: boolean } = { hasTTL: false }
    ): Promise<T | undefined | null> {
        if (config.hasTTL) return await this.get(`${key}:${id}`, defaultValue)
        const data = await this.redis.hget(key, id.toString())
        return data ? (JSON.parse(data) as T) : defaultValue
    }

    async iset<T = any, Z extends string | number = string | number>(key: string, id: Z, object: T | undefined | null, config?: { ttl?: number }) {
        if (config?.ttl) {
            return await this.set(`${key}:${id}`, object, config)
        }
        return await this.redis.hset(key, id, JSON.stringify(object))
    }

    async hGet<T = any>(key: string, id: string, defaultValue?: T): Promise<T | undefined | null> {
        const data = await this.redis.hget(key, id)
        return data ? (JSON.parse(data) as T) : defaultValue
    }

    // eslint-disable-next-line
    async hGetAll<T = any>(key: string, defaultValue?: T): Promise<any> {
        return this.redis.hgetall(key)
    }

    async hSet<T = any>(key: string, id: string, object: T | undefined | null, ttlInSecond?: number): Promise<boolean> {
        let success = true
        const chain = this.redis.multi().hset(key, id, JSON.stringify(object))

        if (ttlInSecond) {
            chain.expire(key, ttlInSecond)
        }

        await chain.exec().catch((err) => {
            success = false
            console.log("hSet error", err)
        })

        return success
    }

    // eslint-disable-next-line
    async hmSet(key: string, object: Object, ttlInSecond?: number): Promise<boolean> {
        let success = true
        const chain = this.redis.multi().hmset(key, object)

        if (ttlInSecond) {
            chain.expire(key, ttlInSecond)
        }

        await chain.exec().catch((err) => {
            success = false
            console.log("mSet error", err)
        })

        return success
    }

    async lPush<T = any>(key: string, object: T | undefined | null, ttlInSecond?: number): Promise<boolean> {
        let success = true
        const chain = this.redis.multi().lpush(key, JSON.stringify(object))

        if (ttlInSecond) {
            chain.expire(key, ttlInSecond)
        }

        await chain.exec().catch((err) => {
            success = false
            console.log("lPush error", err)
        })

        return success
    }

    async lRange<T = any>(key: string, start: number, end: number): Promise<T[]> {
        const data = await this.redis.lrange(key, start, end)
        return data.map((v) => JSON.parse(v))
    }

    async lRem<T = any>(key: string, object: T | undefined | null): Promise<boolean> {
        let success = true
        await this.redis
            .multi()
            .lrem(key, 0, JSON.stringify(object))
            .exec()
            .catch((err) => {
                success = false
                console.log("lRem error", err)
            })

        return success
    }

    async incrBy(key: string, increment: number) {
        return this.redis.incrby(key, increment)
    }

    async try<A, T = A>(key: string, config: { ttl: number } = { ttl: 600 }, f: () => Promise<A>) {
        let data = await this.get<T>(key)
        if (!data) {
            data = (await f()) as any
            if (data) await this.set(key, data, config)
        }
        return data as T
    }

    async itry<A, T = A, Z extends string | number = string | number>(key: string, id: Z, f: (id: Z) => Promise<A>, config?: { ttl?: number }) {
        let data = await this.iget<T>(key, id, undefined, {
            hasTTL: Boolean(config?.ttl)
        })

        if (!data) {
            data = (await f(id)) as any
            if (data) await this.iset(key, id, data, config)
        }
        return data as T
    }

    async lock(key: string, ttlInSecond: number): Promise<boolean> {
        const lockKey = await this.getLockKey(key)

        let success = false
        await this.redis
            .multi()
            .setnx(lockKey, lockKey)
            .expire(lockKey, ttlInSecond)
            .exec((err, results) => {
                if (err) {
                    return
                }

                success = results![0][1]! == 1
            })

        return success
    }

    async keys(pattern: string): Promise<string[]> {
        return this.redis.keys(pattern)
    }

    async unlock(key: string): Promise<boolean> {
        const lockKey = await this.getLockKey(key)
        const res = await this.redis.del(lockKey)
        if (res == 1) {
            return true
        }

        return false
    }

    async getLockKey(key: string): Promise<string> {
        return `cache:lock:${key}`
    }
}
