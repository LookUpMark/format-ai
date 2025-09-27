import { GoogleGenAI } from "@google/genai";

let ai: any | null = null;

/**
 * Lazily initializes and returns the GoogleGenAI client instance.
 * This dynamically imports the library on the first call to prevent startup errors.
 */
const getAiClient = async (): Promise<any> => {
  if (!ai) {
    // Dynamically import the module only when it's needed for the first time.
    const { GoogleGenAI } = await import('@google/genai');
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};


const getPrompt = (text: string) => `
You are an expert content formatter and designer specializing in creating beautiful, readable, and consistent study notes with a dark theme aesthetic. Your task is to convert the user's raw text input into a single, self-contained HTML <article> element, styled exclusively with Tailwind CSS classes.

**Core Mission:**
Every set of notes you generate, regardless of the input content, MUST look like it was created by the same meticulous person. Consistency is paramount.

**Styling Rules (Adhere Strictly to this Dark Theme):**
1.  **Palette:**
    -   Page Background: \`bg-zinc-900\`
    -   Main Text: \`text-zinc-300\`
    -   Primary Accent (Headings, links): \`text-orange-400\`
    -   Code/Highlight Background: \`bg-zinc-950\` or \`bg-zinc-800\`
    -   Borders: \`border-zinc-700\` or \`border-orange-400/30\`
2.  **Typography:**
    -   Overall Font: \`font-sans\`
    -   Headings Font: \`font-serif\`
3.  **Structure & Spacing:**
    -   The root element must be \`<article class="p-8 md:p-12 bg-zinc-900 text-zinc-300 max-w-4xl mx-auto font-sans leading-relaxed">\`.
    -   Use generous spacing between elements (\`mb-4\`, \`mb-6\`, \`mt-8\`).

**Element-Specific Tailwind Classes:**
-   \`<h1>\`: \`font-serif text-4xl font-bold text-orange-400 mb-6 pb-2 border-b-2 border-orange-400/30\`
-   \`<h2>\`: \`font-serif text-3xl font-semibold text-zinc-100 mt-8 mb-4 pb-2 border-b border-zinc-700\`
-   \`<h3>\`: \`font-serif text-xl font-semibold text-zinc-100 mt-6 mb-3\`
-   \`<p>\`: \`mb-4 text-zinc-300\`
-   \`<a>\`: \`text-orange-400 hover:underline\`
-   \`<ul>\`: \`list-disc list-inside mb-4 pl-4 space-y-2\`
-   \`<ol>\`: \`list-decimal list-inside mb-4 pl-4 space-y-2\`
-   \`<blockquote>\`: \`border-l-4 border-orange-400 bg-zinc-800 p-4 my-6 rounded-r-lg italic text-zinc-400\`
-   \`<code>\` (inline): \`bg-zinc-700 text-zinc-200 font-mono text-sm px-1.5 py-1 rounded\`
-   \`<pre>\`: \`bg-zinc-950 border border-zinc-800 text-zinc-300 p-4 rounded-lg overflow-x-auto my-6\` (must contain a \`<code>\` tag).

**Special Rendering Instructions:**
1.  **Mathematical Equations (LaTeX):**
    -   When you encounter LaTeX math, like \`$E=mc^2$\` (inline) or \`$$ \\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2} $$\` (block), you MUST preserve it exactly as is.
    -   Wrap inline equations in \`<span>\`. Example: \`<span>$E=mc^2$</span>\`.
    -   Wrap block equations in \`<div>\`. Example: \`<div>$$ \\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2} $$</div>\`.
    -   The client-side KaTeX library will handle the rendering. DO NOT convert them to MathML or other formats.

2.  **Mermaid.js Diagrams:**
    -   When you identify a Mermaid.js code block, wrap it in a \`<pre>\` tag with the class \`mermaid\`.
    -   Example: \`<pre class="mermaid">graph TD; A-->B;</pre>\`.
    -   The client-side Mermaid library will render this.

**Output Format:**
-   Provide ONLY the HTML for the \`<article>\` and its contents.
-   Do NOT include \`<!DOCTYPE html>\`, \`<html>\`, \`<head>\`, \`<body>\`, or \`<style>\` tags.
-   Ensure the output is a single block of valid HTML.

Here is the user's text to convert:
---
${text}
---
`;

export const generateNotesHtml = async (text: string): Promise<string> => {
  try {
    const genAI = await getAiClient();
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: getPrompt(text),
    });
    
    // Clean up potential markdown code block fences
    const html = response.text
      .replace(/^```html\s*/, '')
      .replace(/```$/, '')
      .trim();
      
    return html;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate HTML from Gemini API. Check console for details.");
  }
};