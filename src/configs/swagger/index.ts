import { INestApplication } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"

export const setupSwagger = (app: INestApplication): void => {
    const xApiKey = process.env.API_KEY || "default-api-key"
    const xAppId = process.env.GAME_CLIENT_APP_ID || "default-app-id"
    const config = new DocumentBuilder()
        .setTitle("User Service")
        .setDescription(
            "User API Documentation\n\n## Overview\nThis API allows you to interact with the User Service. Below are the available endpoints and their descriptions.\n\n## Authentication\nUse the `x-api-key` and `x-app-id` headers when calling, this is a must."
        )
        .setVersion("1.0")
        .addBearerAuth(
            {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            },
            "access-token"
        )
        .addGlobalParameters(
            {
                in: "header",
                required: true,
                name: "x-api-key",
                schema: {
                    example: xApiKey
                }
            },
            {
                in: "header",
                required: true,
                name: "x-app-id",
                schema: {
                    example: xAppId
                }
            }
        )
        .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup("docs", app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            requestInterceptor: (req: any) => {
                // Add custom Origin header to each request
                req.headers["Origin"] = "http://127.0.0.1:3000" // Set your Swagger's origin here0
                return req
            }
        }
    })
}
