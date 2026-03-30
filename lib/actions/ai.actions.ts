'use server';

import { getNews } from "./finnhub.actions";
import { AI_STOCK_RECOMMENDATION_PROMPT } from "../inngest/prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getStockRecommendation(symbol: string) {
    try {
        if (!symbol) throw new Error("Symbol is required");

        // 1. Fetch latest news for the symbol
        const news = await getNews([symbol]);

        if (!news || news.length === 0) {
            return {
                success: false,
                error: "No sufficient news found to provide a recommendation."
            };
        }

        // 2. Prepare the prompt
        const prompt = AI_STOCK_RECOMMENDATION_PROMPT
            .replace('{{symbol}}', symbol.toUpperCase())
            .replace('{{newsData}}', JSON.stringify(news.slice(0, 5), null, 2));

        // 3. Call Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 4. Parse the JSON response
        try {
            // Clean the text in case it contains markdown code blocks
            const jsonStr = text.replace(/```json|```/g, "").trim();
            const recommendation = JSON.parse(jsonStr);

            return {
                success: true,
                data: recommendation
            };
        } catch (parseError) {
            console.error("Failed to parse AI response:", text);
            return {
                success: false,
                error: "Failed to process AI recommendation format."
            };
        }
    } catch (error: any) {
        console.error("AI Recommendation Error:", error);
        return {
            success: false,
            error: error.message || "An error occurred while fetching AI recommendation."
        };
    }
}
