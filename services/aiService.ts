import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

let geminiAi: any | null = null;
let geminiChat: any | null = null;
let openaiClient: OpenAI | null = null;

export type Provider = 'gemini' | 'openrouter';

interface ProviderConfig {
  provider: Provider;
  model: string;
  apiKey: string;
}

const systemInstruction = `
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
    -   When you encounter LaTeX math, like \`$E=mc^2$\` (inline) or \`$$ \\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt\\pi}{2} $$\` (block), you MUST preserve it exactly as is.
    -   Wrap inline equations in \`<span>\`. Example: \`<span>$E=mc^2$</span>\`.
    -   Wrap block equations in \`<div>\`. Example: \`<div>$$ \\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt\\pi}{2} $$</div>\`.
    -   The client-side KaTeX library will handle the rendering. DO NOT convert them to MathML or other formats.

2.  **Mermaid.js Diagrams:**
    -   When you identify a Mermaid.js code block, wrap it in a \`<pre>\` tag with the class \`mermaid\`.
    -   Example: \`<pre class="mermaid">graph TD; A-->B;</pre>\`.
    -   The client-side Mermaid library will render this.
    -   **Mermaid Syntax - Source of Truth:** You MUST assume the following examples are the only valid syntaxes for Mermaid diagrams. Do not deviate.

    ### Flowchart
    flowchart LR
    A[Hard] -->|Text| B(Round)
    B --> C{Decision}
    C -->|One| D[Result 1]
    C -->|Two| E[Result 2]

    ### Sequence diagram
    sequenceDiagram
    Alice->>John: Hello John, how are you?
    loop HealthCheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!

    ### Gantt chart
    gantt
        section Section
        Completed :done,    des1, 2014-01-06,2014-01-08
        Active        :active,  des2, 2014-01-07, 3d
        Parallel 1   :         des3, after des1, 1d
        Parallel 2   :         des4, after des1, 1d
        Parallel 3   :         des5, after des3, 1d
        Parallel 4   :         des6, after des4, 1d

    ### Class diagram
    classDiagram
    Class01 <|-- AveryLongClass : Cool
    <<Interface>> Class01
    Class09 --> C2 : Where am I?
    Class09 --* C3
    Class09 --|> Class07
    Class07 : equals()
    Class07 : Object[] elementData
    Class01 : size()
    Class01 : int chimp
    Class01 : int gorilla
    class Class10 {
      <<service>>
      int id
      size()
    }

    ### State diagram
    stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]

    ### Pie chart
    pie
    "Dogs" : 386
    "Cats" : 85.9
    "Rats" : 15

    ### Git graph
    gitGraph
      commit
      commit
      branch develop
      checkout develop
      commit
      commit
      checkout main
      merge develop
      commit
      commit

    ### User Journey diagram
      journey
        title My working day
        section Go to work
          Make tea: 5: Me
          Go upstairs: 3: Me
          Do work: 1: Me, Cat
        section Go home
          Go downstairs: 5: Me
          Sit down: 3: Me

    ### C4 diagram
    C4Context
    title System Context diagram for Internet Banking System

    Person(customerA, "Banking Customer A", "A customer of the bank, with personal bank accounts.")
    Person(customerB, "Banking Customer B")
    Person_Ext(customerC, "Banking Customer C")
    System(SystemAA, "Internet Banking System", "Allows customers to view information about their bank accounts, and make payments.")

    Person(customerD, "Banking Customer D", "A customer of the bank, <br/> with personal bank accounts.")

    Enterprise_Boundary(b1, "BankBoundary") {

      SystemDb_Ext(SystemE, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")

      System_Boundary(b2, "BankBoundary2") {
        System(SystemA, "Banking System A")
        System(SystemB, "Banking System B", "A system of the bank, with personal bank accounts.")
      }

      System_Ext(SystemC, "E-mail system", "The internal Microsoft Exchange e-mail system.")
      SystemDb(SystemD, "Banking System D Database", "A system of the bank, with personal bank accounts.")

      Boundary(b3, "BankBoundary3", "boundary") {
        SystemQueue(SystemF, "Banking System F Queue", "A system of the bank, with personal bank accounts.")
        SystemQueue_Ext(SystemG, "Banking System G Queue", "A system of the bank, with personal bank accounts.")
      }
    }

    BiRel(customerA, SystemAA, "Uses")
    BiRel(SystemAA, SystemE, "Uses")
    Rel(SystemAA, SystemC, "Sends e-mails", "SMTP")
    Rel(SystemC, customerA, "Sends e-mails to")


**Output Format:**
-   Provide ONLY the HTML for the \`<article>\` and its contents.
-   Do NOT include \`<!DOCTYPE html>\`, \`<html>\`, \`<head>\`, \`<body>\`, or \`<style>\` tags.
-   Ensure the output is a single block of valid HTML.
`;

const getGeminiClient = async (): Promise<any> => {
  if (!geminiAi) {
    const { GoogleGenAI } = await import('@google/genai');
    geminiAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
  }
  return geminiAi;
};

const getOpenAIClient = async (apiKey: string): Promise<OpenAI> => {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }
  return openaiClient;
};

const generateWithGemini = async (text: string): Promise<string> => {
  const genAI = await getGeminiClient();

  if (!geminiChat) {
    geminiChat = genAI.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
    });
  }

  const userMessage = `Here is the user's text to convert:\n---\n${text}\n---`;
  const response = await geminiChat.sendMessage({ message: userMessage });

  return response.text
    .replace(/^```html\s*/, '')
    .replace(/```$/, '')
    .trim();
};

const generateWithOpenRouter = async (text: string, model: string, apiKey: string): Promise<string> => {
  const openai = await getOpenAIClient(apiKey);

  const response = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: systemInstruction
      },
      {
        role: 'user',
        content: `Here is the user's text to convert:\n---\n${text}\n---`
      }
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  let html = response.choices[0]?.message?.content || '';

  // Clean up potential markdown code block fences from the overall response
  html = html
    .replace(/^```html\s*/, '')
    .replace(/```$/, '')
    .trim();

  // Aggressively clean up mermaid blocks specifically
  html = html.replace(/(<pre class="mermaid">)([\s\S]*?)(<\/pre>)/g, (match, startTag, content, endTag) => {
    const cleanedContent = content
      .replace(/^```mermaid\s*/, '') // Remove opening ```mermaid fence
      .replace(/^```\s*/, '')        // Remove opening ``` fence
      .replace(/```\s*$/, '')       // Remove closing ``` fence
      .trim();
    return `${startTag}${cleanedContent}${endTag}`;
  });

  return html;
};

export const generateNotesHtml = async (
  text: string,
  config: ProviderConfig
): Promise<string> => {
  try {
    switch (config.provider) {
      case 'gemini':
        return await generateWithGemini(text);
      case 'openrouter':
        return await generateWithOpenRouter(text, config.model, config.apiKey);
      default:
        throw new Error(`Unsupported provider: ${config.provider}`);
    }
  } catch (error) {
    console.error(`Error calling ${config.provider} API:`, error);
    throw new Error(`Failed to generate HTML from ${config.provider} API. Check console for details.`);
  }
};

export const getAvailableProviders = (): Provider[] => {
  return ['gemini', 'openrouter'];
};

export const getDefaultModel = (provider: Provider): string => {
  switch (provider) {
    case 'gemini':
      return 'gemini-2.5-flash';
    case 'openrouter':
      return 'anthropic/claude-3.5-sonnet';
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
};