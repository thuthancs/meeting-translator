import { GoogleGenerativeAI } from "@google/generative-ai";
import { useEffect, useState } from "react";
import "./App.css";

// Instantiate the AI Client and define constants outside the component
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const STYLES = ["Gen Z", "Shakespeare", "Corporate", "Yoda", "Pirate", "Rap", "Victorian Era"];

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("dark");

  const formatMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold text
      .replace(/^\* (.+)$/gm, '• $1');  // Convert * lists to bullet points
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "dark" ? "light" : "dark");
  };

  // Helper function to get style-specific class name
  const getStyleClass = (style) => {
    return style.toLowerCase().replace(/\s+/g, '-');
  };

  const handleSelectedStyle = (event) => {
    setSelectedStyle(event.target.value);
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleTranslate = async () => {
    if (!input || !selectedStyle) {
      setOutput("⚠️ Please enter text and select a style first.");
      return;
    }

    // Check if API key is loaded
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      setOutput("❌ API key not found. Please check your .env file.");
      return;
    }

    setLoading(true);
    setOutput("");

    const prompt = `Rewrite the following meeting notes in ${selectedStyle} style:\n\n${input}`;

    try {
      // Get the generative model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Generate content
      const result = await model.generateContent(prompt);
      
      // Get the response text
      const response = await result.response;
      const text = response.text();
      
      console.log(text);
      setOutput(text);
      
    } catch (error) {
      console.error("API Error:", error);
      
      // More detailed error handling
      if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("API key")) {
        setOutput("❌ Invalid API key. Please check your environment variables.");
      } else if (error.message?.includes("quota") || error.message?.includes("limit")) {
        setOutput("❌ API quota exceeded. Please try again later.");
      } else if (error.message?.includes("SAFETY") || error.message?.includes("blocked")) {
        setOutput("❌ The response was blocked due to safety settings. Please try a different input.");
      } else {
        setOutput(`❌ An error occurred: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="app-header">
        <div className="header-content">
          <h1 className="app-title">📝 Meeting Notes Translator</h1>
          <p className="app-subtitle">Transform your boring meeting notes into any style you want!</p>
        </div>
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === "dark" ? "🌞" : "🌙"}
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>

      {/* Main Content Card */}
      <div className="main-card">
        {/* Input Section */}
        <div className="input-section">
          <label className="input-label">
            Your Meeting Notes
          </label>
          <textarea
            placeholder="Paste your meeting notes here..."
            value={input}
            onChange={handleInputChange}
            className="meeting-textarea"
          />
        </div>

        {/* Style Selection */}
        <div className="style-section">
          <label className="input-label">
            Choose Your Style
          </label>
          <div className="style-grid">
            {STYLES.map((style) => (
              <div key={style} className="style-option">
                <input
                  type="radio"
                  id={`style-${style}`}
                  value={style}
                  checked={selectedStyle === style}
                  onChange={handleSelectedStyle}
                  className="style-radio"
                />
                <label 
                  htmlFor={`style-${style}`} 
                  className={`style-label ${selectedStyle === style ? `style-${getStyleClass(style)}` : ''}`}
                >
                  {style}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Translate Button */}
        <button
          onClick={handleTranslate}
          disabled={loading || !input || !selectedStyle}
          className="translate-button"
        >
          {loading ? (
            <>
              <div className="loading-spinner"></div>
              Translating...
            </>
          ) : (
            '✨ Translate Notes'
          )}
        </button>
      </div>

      {/* Output Section */}
      {output && (
        <div className="output-card">
          <h3 className="output-title">
            🎭 Your Translated Meeting Notes
          </h3>
          <div 
            className={`output-content ${selectedStyle ? getStyleClass(selectedStyle) : ''}`}
            dangerouslySetInnerHTML={{ __html: formatMarkdown(output) }}
          />
        </div>
      )}
    </div>
  );
}

export default App;