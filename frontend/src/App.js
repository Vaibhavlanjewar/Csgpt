import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";

import AuthForm from "./components/AuthForm";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ResponseSection from "./components/ResponseSection";
import AboutUs from "./components/AboutUs";
import FAQs from "./components/FAQs";
import Footer from "./components/Footer";

import "./styles/App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [aiResponse, setAIResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const generatePrompt = (topic) => {
    return `As a Computer Science expert, provide a detailed explanation of "${topic}" covering:

1. **Core Concept** (Clear definition and purpose)
2. **Technical Details** (How it works under the hood)
3. **Implementation** (Code examples in relevant languages)
4. **Real-world Applications** (Where and why it's used)
5. **Common Interview Questions** (With concise answers)

Format response in clean Markdown with proper headings and code blocks.`;
  };

  const handleTopicClick = async (topic) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    setError(null);
    setAIResponse("");

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      const response = await axios.post(`${backendUrl}/api/ask-ai`, {
        prompt: generatePrompt(topic),
      });
      setAIResponse(response.data.response);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setError("Failed to fetch response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <AuthForm onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="App">
        <Navbar onLogout={() => setIsAuthenticated(false)} />
        <div className="content-container">
          <div className="content-wrapper">
            <Sidebar onTopicClick={handleTopicClick} />
            <div className="main-content">
              <Routes>
                <Route
                  path="/"
                  element={
                    <ResponseSection
                      selectedTopic={selectedTopic}
                      aiResponse={aiResponse}
                      isLoading={isLoading}
                      error={error}
                    />
                  }
                />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/faqs" element={<FAQs />} />
              </Routes>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
