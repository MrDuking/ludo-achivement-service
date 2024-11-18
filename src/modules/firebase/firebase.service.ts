import { Inject, Injectable } from "@nestjs/common"
import * as admin from "firebase-admin"
import { Database, Reference } from "firebase-admin/database"

@Injectable()
export class FirebaseService {
    private readonly db: Database
    private readonly session: Reference

    constructor(@Inject("FIREBASE_APP") private readonly firebaseApp: admin.app.App) {
        this.db = admin.database(this.firebaseApp)
        this.session = this.db.ref("session")
    }

    async setUserSessionId(userId: string, sessionId: string) {
        try {
            await this.session.child(userId).set(sessionId)
        } catch (error) {
            throw new Error(`Failed to set user's session id: ${error.message}`)
        }
    }
}
