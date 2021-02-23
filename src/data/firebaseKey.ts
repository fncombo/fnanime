/**
 * Encodes any string to a valid Firebase key.
 */
const encodeFirebaseKey = (string: string): string => encodeURIComponent(string).replace(/\./g, '%2E')

/**
 * Decodes a Firebase key into the original string.
 */
const decodeFirebaseKey = (key: string): string => decodeURIComponent(key.replace(/\./g, '%2E'))

export { encodeFirebaseKey, decodeFirebaseKey }
