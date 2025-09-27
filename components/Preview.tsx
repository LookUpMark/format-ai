import React, { useEffect, useRef, useState } from 'react';

interface PreviewProps {
  htmlContent: string;
}

const getFullHtmlPage = (bodyContent: string): string => `<!DOCTYPE html>
<html lang="it">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>I tuoi Appunti</title>
      <script src="https://cdn.tailwindcss.com"><\/script>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"><\/script>
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"><\/script>
      <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"><\/script>
      <script>
        document.addEventListener('DOMContentLoaded', function () {
           renderMathInElement(document.body, {
             delimiters: [
               { left: '$$', right: '$$', display: true },
               { left: '$', right: '$', display: false }
             ],
             throwOnError: false
           });
           mermaid.initialize({ startOnLoad: true, theme: 'dark' });
        });
      <\/script>
      <style>
        body { background-color: #18181b; color: #d4d4d8; }
        /* Fix for Mermaid diagrams to ensure visibility on dark background */
        .mermaid { background-color: transparent !important; }
        .mermaid svg {
            color: #d4d4d8;
        }
      </style>
    </head>
    <body class="bg-zinc-900 text-zinc-300">
      ${bodyContent}
    </body>
  </html>
`;


const Preview: React.FC<PreviewProps> = ({ htmlContent }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (htmlContent && previewRef.current) {
      const element = previewRef.current;
      element.innerHTML = htmlContent;

      // Defer rendering to the next tick to ensure the DOM is fully updated.
      // This is crucial for libraries that scan the DOM like KaTeX and Mermaid.
      const timerId = setTimeout(() => {
        if (!element) return; // Guard against component unmount

        try {
          // Render KaTeX
          const katex = (window as any).renderMathInElement;
          if (katex) {
            katex(element, {
              delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false },
              ],
              throwOnError: false
            });
          }
        } catch (e) {
          console.error('Error rendering KaTeX:', e);
        }

        try {
          // Render Mermaid
          const mermaid = (window as any).mermaid;
          if (mermaid) {
              mermaid.initialize({ startOnLoad: false, theme: 'dark' });
              const mermaidElements = element.querySelectorAll('.mermaid');
              if (mermaidElements.length > 0) {
                mermaid.run({nodes: mermaidElements});
              }
          }
        } catch (e) {
          console.error('Error rendering Mermaid:', e);
        }
      }, 50); // A small delay is safer than 0 for some browser rendering engines.

      return () => clearTimeout(timerId); // Cleanup timeout on re-render
    }
  }, [htmlContent]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleOpenInNewTab = () => {
    const fullHtml = getFullHtmlPage(htmlContent);
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4 border-b border-zinc-800 pb-3">
        <button onClick={handleCopy} className="flex items-center px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{isCopied ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />}</svg>
          {isCopied ? 'Copiato!' : 'Copia HTML'}
        </button>
        <button onClick={handleOpenInNewTab} className="flex items-center px-3 py-1.5 text-sm bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          Apri in una nuova scheda
        </button>
      </div>
      <div 
        ref={previewRef} 
        className="prose prose-invert max-w-none flex-grow overflow-y-auto bg-zinc-900 p-4 rounded-b-lg"
      />
    </div>
  );
};

export default Preview;