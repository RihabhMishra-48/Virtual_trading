import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const testConnection = async () => {
    if (!MONGODB_URI) {
        console.error('MONGODB_URI is not set');
        process.exit(1);
    }
    console.log('Attempting to connect to MongoDB...');
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Successfully connected to MongoDB!');
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    } catch (err) {
        console.error('Connection failed:', err);
    }
    process.exit(0);
};

testConnection();
