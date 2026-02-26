import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    }
}

let cached = global.mongooseCache;

if (!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
    if (!MONGODB_URI) throw new Error('MONGODB_URI must be set within .env');

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
    }

    try {
        cached.conn = await cached.promise;
    } catch (err: any) {
        cached.promise = null;

        // Improve error message for common Atlas connection issues (IP Whitelist)
        if (err.name === 'MongooseServerSelectionError' || err.code === 'ETIMEOUT' || err.message.includes('querySrv ETIMEOUT')) {
            const enhancedError = new Error(
                `MongoDB Connection failed. This is likely an IP Whitelist issue.\n` +
                `Your current IP might not be allowed to access the Atlas cluster.\n` +
                `Please whitelist your IP in MongoDB Atlas: https://www.mongodb.com/docs/atlas/security-whitelist/\n` +
                `Original Error: ${err.message}`
            );
            (enhancedError as any).originalError = err;
            throw enhancedError;
        }

        throw err;
    }

    console.log(`Connected to database ${process.env.NODE_ENV} - ${MONGODB_URI}`);

    return cached.conn;
}
