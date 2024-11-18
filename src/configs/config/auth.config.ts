import { registerAs } from "@nestjs/config"

export default registerAs("auth-config", () => ({
    secret: process.env.AUTH_SECRET || "secret",
    expiresIn: +process.env.AUTH_EXPIRES_IN! || 60000
}))
