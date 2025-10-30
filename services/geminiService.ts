
import { GoogleGenAI } from '@google/genai';
import { CodeSnippet, ImprovementStep } from '../types';
import { CODE_GENERATION_SCHEMA, INITIAL_SYSTEM_PROMPT, IMPROVEMENT_SYSTEM_PROMPT } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper to sanitize and parse JSON from the model's text response
const parseJsonResponse = (text: string): any => {
    const jsonRegex = /```json\n([\s\S]*?)\n```/;
    const match = text.match(jsonRegex);
    const jsonString = match ? match[1] : text;
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse JSON:", jsonString);
        throw new Error("Invalid JSON response from model.");
    }
};

export const generateInitialSnippet = async (prompt: string, onStream: (chunk: string) => void): Promise<CodeSnippet> => {
    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: INITIAL_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            responseSchema: CODE_GENERATION_SCHEMA,
        },
    });

    let fullResponseText = '';
    let lastStreamedExplanation = '';
    for await (const chunk of responseStream) {
        fullResponseText += chunk.text ?? '';
        
        try {
            // Use a regex to find the explanation in a possibly incomplete JSON string.
            const explanationMatch = fullResponseText.match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)/);
            if (explanationMatch && explanationMatch[1]) {
                // Handle all JSON string escapes correctly by parsing just the string value.
                const currentExplanation = JSON.parse(`"${explanationMatch[1]}"`);
                if (currentExplanation.length > lastStreamedExplanation.length) {
                    const newExplanationChunk = currentExplanation.substring(lastStreamedExplanation.length);
                    onStream(newExplanationChunk);
                    lastStreamedExplanation = currentExplanation;
                }
            }
        } catch (e) {
            // Ignore parsing errors during the stream, as JSON will often be incomplete.
        }
    }
    
    const finalData = parseJsonResponse(fullResponseText);
    
    // Ensure the full explanation has been streamed in case the stream ended mid-word.
    const finalExplanation = finalData.explanation || '';
    if (finalExplanation.length > lastStreamedExplanation.length) {
        onStream(finalExplanation.substring(lastStreamedExplanation.length));
    }

    return {
        html: finalData.html,
        css: finalData.css,
        js: finalData.js,
    };
};

export const improveSnippet = async (
    code: CodeSnippet,
    screenshotBase64: string,
    history: ImprovementStep[],
    onStream: (chunk: string) => void
): Promise<{ newCode: CodeSnippet; explanation: string }> => {
    
    const historyText = history.map((step, index) => `Improvement ${index + 1}: ${step.explanation}`).join('\n');
    const promptParts = [
        { text: `Current Code:\n\`\`\`json\n${JSON.stringify(code, null, 2)}\n\`\`\`` },
        { text: `History of previous improvements:\n${historyText || 'None'}` },
        { inlineData: { mimeType: 'image/jpeg', data: screenshotBase64 } },
        { text: "Analyze the code and the screenshot, identify a flaw, and provide the improved code."}
    ];

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-pro', // Using Pro for better multimodal analysis
        contents: { parts: promptParts },
        config: {
            systemInstruction: IMPROVEMENT_SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            responseSchema: CODE_GENERATION_SCHEMA,
        }
    });

    let fullResponseText = '';
    let lastStreamedExplanation = '';
    for await (const chunk of responseStream) {
        fullResponseText += chunk.text ?? '';
        
        try {
            // Use a regex to find the explanation in a possibly incomplete JSON string.
            const explanationMatch = fullResponseText.match(/"explanation"\s*:\s*"((?:[^"\\]|\\.)*)/);
            if (explanationMatch && explanationMatch[1]) {
                // Handle all JSON string escapes correctly by parsing just the string value.
                const currentExplanation = JSON.parse(`"${explanationMatch[1]}"`);
                if (currentExplanation.length > lastStreamedExplanation.length) {
                    const newExplanationChunk = currentExplanation.substring(lastStreamedExplanation.length);
                    onStream(newExplanationChunk);
                    lastStreamedExplanation = currentExplanation;
                }
            }
        } catch (e) {
            // Ignore parsing errors during the stream, as JSON will often be incomplete.
        }
    }

    const finalData = parseJsonResponse(fullResponseText);
    
    // Ensure the full explanation has been streamed in case the stream ended mid-word.
    const finalExplanation = finalData.explanation || '';
    if (finalExplanation.length > lastStreamedExplanation.length) {
        onStream(finalExplanation.substring(lastStreamedExplanation.length));
    }

    return {
        newCode: {
            html: finalData.html,
            css: finalData.css,
            js: finalData.js,
        },
        explanation: finalData.explanation,
    };
};
