const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const path = require("path");

// Load .env from the root directory
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY not found in .env");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Using the v1 endpoint explicitly might help or just listing
        // Note: The SDK does not have a direct listModels, but we can try to use the fetch API
        // or just guess common ones. But let's try to use the REST API directly.

        console.log("Checking for gemini-1.5-flash, gemini-1.5-pro, and gemini-pro...");

        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("test");
                if (result.response) {
                    console.log(`Model ${modelName} is AVAILABLE`);
                }
            } catch (e) {
                console.log(`Model ${modelName} is NOT AVAILABLE: ${e.message}`);
            }
        }
    } catch (e) {
        console.error("Error color checking:", e.message);
    }
}

listModels();
