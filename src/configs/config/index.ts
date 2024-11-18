import AppConfig from "./app.config"
import AuthConfig from "./auth.config"
import RedisConfig from "./redis.config"
const configurations = [AppConfig, AuthConfig, RedisConfig]

export { AppConfig, AuthConfig, RedisConfig, configurations }
