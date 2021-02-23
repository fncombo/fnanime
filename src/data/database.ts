import dotenv from 'dotenv'
import firebaseAdmin, { ServiceAccount } from 'firebase-admin'

import firebaseKey from '../../firebase.json'

dotenv.config()

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(firebaseKey as ServiceAccount),
    databaseURL: process.env.DATABASE_URL,
})

const database = firebaseAdmin.database()

/**
 * Closes the Firebase connection so that the Node process can exit.
 */
const closeDatabase = (): Promise<void> => firebaseAdmin.app().delete()

export { database, closeDatabase }
