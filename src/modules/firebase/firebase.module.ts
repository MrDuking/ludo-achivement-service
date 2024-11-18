import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as admin from "firebase-admin"
import { FirebaseService } from "./firebase.service"
@Module({
    providers: [
        FirebaseService,
        {
            provide: "FIREBASE_APP",
            useFactory: (configService: ConfigService) => {
                const adminConfig: admin.ServiceAccount = {
                    projectId: configService.get<string>("FIREBASE_PROJECT_ID"),
                    privateKey: configService.get<string>("FIREBASE_PRIVATE_KEY")?.replace(/\\n/g, "\n"),
                    clientEmail: configService.get<string>("FIREBASE_CLIENT_EMAIL")
                }

                let app: admin.app.App
                try {
                    app = admin.initializeApp({
                        credential: admin.credential.cert(adminConfig),
                        databaseURL: configService.get<string>("FIREBASE_DATABASE_URL")
                    })
                } catch (error) {
                    app = admin.app()
                }

                return app
            },
            inject: [ConfigService]
        }
    ],
    exports: [FirebaseService]
})
export class FirebaseModule {}
