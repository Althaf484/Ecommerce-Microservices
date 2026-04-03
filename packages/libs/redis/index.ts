import Redis from "ioredis";

const redis = new Redis(process.env.UPSTASH_REDIS_URL as string);

export default redis;
