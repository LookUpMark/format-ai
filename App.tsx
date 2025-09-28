import React, { useState, useCallback, useEffect } from 'react';
import Preview from './components/Preview';
import { Provider, generateNotesHtml, getDefaultModel } from './services/aiService';

const Header: React.FC = () => (
  <header className="border-b border-zinc-800">
    <div className="container mx-auto px-6 py-4">
      <h1 className="text-3xl font-bold text-zinc-100">FormatAI ✨</h1>
      <p className="text-zinc-400 mt-1">Transform raw text into beautifully formatted content.</p>
    </div>
  </header>
);

const Loader: React.FC = () => (
    <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10">
        <svg className="animate-spin h-10 w-10 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-zinc-400 font-medium">Generating notes in progress...</p>
    </div>
);


const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider>('gemini');
  const [customModel, setCustomModel] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [openrouterApiKey, setOpenrouterApiKey] = useState<string>('');
  const [showApiKeys, setShowApiKeys] = useState<boolean>(false);

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
        setError("Please upload a valid text file (e.g. .txt, .md). For PDFs, copy and paste the content.");
      }
    }
  };

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const savedGeminiKey = localStorage.getItem('gemini_api_key');
    const savedOpenrouterKey = localStorage.getItem('openrouter_api_key');

    if (savedGeminiKey) setGeminiApiKey(savedGeminiKey);
    if (savedOpenrouterKey) setOpenrouterApiKey(savedOpenrouterKey);
  }, []);

  // Save API keys to localStorage when they change
  useEffect(() => {
    if (geminiApiKey) {
      localStorage.setItem('gemini_api_key', geminiApiKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }, [geminiApiKey]);

  useEffect(() => {
    if (openrouterApiKey) {
      localStorage.setItem('openrouter_api_key', openrouterApiKey);
    } else {
      localStorage.removeItem('openrouter_api_key');
    }
  }, [openrouterApiKey]);

  const handleSubmit = useCallback(async () => {
    if (!inputText.trim()) {
      setError("The input text cannot be empty.");
      return;
    }

    const apiKey = selectedProvider === 'gemini'
      ? (geminiApiKey || process.env.GEMINI_API_KEY || process.env.API_KEY)
      : (openrouterApiKey || process.env.OPENROUTER_API_KEY);

    if (!apiKey) {
      setError(`API key for ${selectedProvider} not configured. Please enter your ${selectedProvider === 'gemini' ? 'Google Gemini' : 'OpenRouter'} API key below.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedHtml('');

    try {
      const model = customModel.trim() || getDefaultModel(selectedProvider);
      const html = await generateNotesHtml(inputText, {
        provider: selectedProvider,
        model: model,
        apiKey: apiKey
      });
      setGeneratedHtml(html);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, selectedProvider, customModel, geminiApiKey, openrouterApiKey]);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Input Panel */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-zinc-200 mb-4">Input</h2>
            <div className="space-y-4">
              {/* API Keys Section */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="flex items-center text-sm font-medium text-zinc-400 hover:text-orange-400 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 transform transition-transform ${showApiKeys ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  API Keys
                </button>

                {showApiKeys && (
                  <div className="space-y-3 pl-5 border-l border-zinc-700">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-zinc-500">
                        Google Gemini API Key
                      </label>
                      <input
                        type="password"
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder="Enter your Google Gemini API key..."
                        className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-200 placeholder:text-zinc-600 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                      />
                      <p className="text-xs text-zinc-600">
                        Get your key from: https://makersuite.google.com/app/apikey
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-zinc-500">
                        OpenRouter API Key
                      </label>
                      <input
                        type="password"
                        value={openrouterApiKey}
                        onChange={(e) => setOpenrouterApiKey(e.target.value)}
                        placeholder="Enter your OpenRouter API key..."
                        className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-200 placeholder:text-zinc-600 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                      />
                      <p className="text-xs text-zinc-600">
                        Get your key from: https://openrouter.ai/keys
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Provider Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-400">AI Provider</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value as Provider)}
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openrouter">OpenRouter</option>
                </select>
              </div>

              {/* Custom Model Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-400">
                  Model {selectedProvider === 'gemini' ? '(optional)' : ''}
                </label>
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder={selectedProvider === 'gemini' ? 'e.g.: gemini-2.5-flash' : 'e.g.: anthropic/claude-3.5-sonnet'}
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-200 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                />
                <p className="text-sm text-zinc-500">
                  {selectedProvider === 'gemini'
                    ? 'Leave empty to use gemini-2.5-flash'
                    : 'OpenRouter Model (e.g.: openai/gpt-4, anthropic/claude-3.5-sonnet)'
                  }
                </p>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Write or paste your text, markdown, LaTeX equations, or Mermaid diagrams here..."
                className="w-full h-60 p-3 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-200 placeholder:text-zinc-500 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 resize-y"
              />
              <div>
                <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-4 py-2 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Or upload a file (.txt, .md)
                </label>
                <input id="file-upload" type="file" className="hidden" accept=".txt,.md,.markdown" onChange={handleFileChange} />
                <p className="text-sm text-zinc-500 mt-2">For PDF files, it is recommended to copy and paste the text.</p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !inputText}
                className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-md hover:bg-orange-600 transition duration-200 disabled:bg-orange-400/50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? 'Generating...' : 'Format Content'}
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl relative min-h-[500px]">
             <h2 className="text-2xl font-bold text-zinc-200 mb-4">Preview</h2>
             {isLoading && <Loader />}
             {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-md">{error}</div>}

             {!isLoading && !generatedHtml && !error && (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-4 text-center">The preview of your notes will appear here.</p>
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