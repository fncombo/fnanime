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

/**
 * Encodes any string to a valid Firebase key.
 */
const encodeFirebaseKey = (string: string): string => encodeURIComponent(string).replace(/\./g, '%2E')

/**
 * Decodes a Firebase key into the original string.
 */
const decodeFirebaseKey = (key: string): string => decodeURIComponent(key.replace(/\./g, '%2E'))

export { database, closeDatabase, encodeFirebaseKey, decodeFirebaseKey }
