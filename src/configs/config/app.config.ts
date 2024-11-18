import { registerAs } from "@nestjs/config"

export default registerAs("app-config", () => ({
    serviceName: process.env.SERVICE_NAME || "ludo_auth_service",
    port: process.env.PORT || 3001,
    version: process.env.VERSION || "1.0",
    nodeEnv: process.env.NODE_ENV || "",
    logDir: process.env.LOG_DIR || "logs"
}))
