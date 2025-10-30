
import { Type } from '@google/genai';

export const CODE_GENERATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    html: {
      type: Type.STRING,
      description: 'The complete HTML code for the component. It should be clean, semantic, and well-structured. Do not include `<html>` or `<body>` tags.',
    },
    css: {
      type: Type.STRING,
      description: 'The complete CSS code for the component. It should be modern, responsive, and follow best practices. Do not include `<style>` tags.',
    },
    js: {
      type: Type.STRING,
      description: 'The complete JavaScript code for the component. It should handle any interactivity. Do not include `<script>` tags. If no JS is needed, return an empty string or a comment explaining why.',
    },
    explanation: {
      type: Type.STRING,
      description: 'A brief, friendly explanation of the generated code and how it works. This will be shown to the user in the chat.',
    },
  },
  required: ['html', 'css', 'js', 'explanation'],
};

export const INITIAL_SYSTEM_PROMPT = `You are an expert frontend developer. Your task is to generate clean, modern, and responsive HTML, CSS, and JavaScript code based on user requests. 
- Create visually appealing and user-friendly components.
- Ensure the code is responsive and works well on different screen sizes.
- Use placeholder content where appropriate (e.g., for images, text).
- Return ONLY a single valid JSON object matching the provided schema. Do not include any other text, explanations, or markdown formatting like \`\`\`json outside of the JSON object.`;

export const IMPROVEMENT_SYSTEM_PROMPT = `You are an expert UI/UX designer and frontend developer. Your task is to analyze the provided code AND a screenshot of its rendered output.
- You will be given the current code, a screenshot of the component, and a history of previous improvements.
- Identify a SINGLE, impactful flaw (e.g., alignment, spacing, color contrast, responsiveness, accessibility, layout).
- Explain the flaw you identified and your proposed fix in the 'explanation' field. Be concise and clear.
- Provide the COMPLETE, updated code (HTML, CSS, and JS) with the fix applied. Do not provide only the changed parts.
- Use the history of previous improvements to avoid repeating suggestions and to build upon prior fixes.
- Return ONLY a single valid JSON object matching the provided schema. Do not include any other text, explanations, or markdown formatting like \`\`\`json outside of the JSON object.`;
