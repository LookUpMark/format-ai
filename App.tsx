import React, { useState, useCallback } from 'react';
import Preview from './components/Preview';

const Header: React.FC = () => (
  <header className="border-b border-zinc-800">
    <div className="container mx-auto px-6 py-4">
      <h1 className="text-3xl font-bold text-zinc-100">Appunti Intelligenti ✨</h1>
      <p className="text-zinc-400 mt-1">Trasforma il testo grezzo in note meravigliosamente formattate.</p>
    </div>
  </header>
);

const Loader: React.FC = () => (
    <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10">
        <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-zinc-400 font-medium">Generazione delle note in corso...</p>
    </div>
);


const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('text/')) {
        setError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
          setInputText(e.target?.result as string);
        };
        reader.readAsText(file);
      } else {
        setError("Per favore carica un file di testo valido (es. .txt, .md). Per i PDF, copia e incolla il contenuto.");
      }
    }
  };
  
  const handleSubmit = useCallback(async () => {
    if (!inputText.trim()) {
      setError("Il testo di input non può essere vuoto.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedHtml('');

    try {
      const { generateNotesHtml } = await import('./services/geminiService');
      const html = await generateNotesHtml(inputText);
      setGeneratedHtml(html);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Si è verificato un errore sconosciuto.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Panel */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-zinc-200 mb-4">Input</h2>
            <div className="space-y-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Scrivi o incolla qui il tuo testo, markdown, equazioni LaTeX o diagrammi Mermaid..."
                className="w-full h-80 p-3 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-200 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 resize-y"
              />
              <div>
                <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-4 py-2 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  O carica un file (.txt, .md)
                </label>
                <input id="file-upload" type="file" className="hidden" accept=".txt,.md,.markdown" onChange={handleFileChange} />
                <p className="text-sm text-zinc-500 mt-2">Per i file PDF, si consiglia di copiare e incollare il testo.</p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !inputText}
                className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-md hover:bg-orange-600 transition duration-200 disabled:bg-orange-400/50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? 'Generazione...' : 'Crea Appunti'}
              </button>
            </div>
          </div>
          
          {/* Output Panel */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative min-h-[500px]">
             <h2 className="text-2xl font-bold text-zinc-200 mb-4">Anteprima</h2>
             {isLoading && <Loader />}
             {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-md">{error}</div>}
            
             {!isLoading && !generatedHtml && !error && (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-4 text-center">L'anteprima delle tue note apparirà qui.</p>
                </div>
             )}

            {generatedHtml && <Preview htmlContent={generatedHtml} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;