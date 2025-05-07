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
    return `As an AI-powered Computer Science educator, provide a comprehensive explanation of "${topic}" with:

1. **Fundamental Concepts** (200-300 words)
   - Core definition and purpose
   - Key characteristics and components
   - Theoretical foundations

2. **Practical Applications** (150-250 words)
   - Real-world use cases
   - Industry implementations
   - Academic relevance

3. **Technical Implementation**
   - Code examples in Python, Java, and C++
   - Algorithm analysis (time/space complexity where applicable)
   - Common implementation patterns

4. **Comparison & Relationships**
   - Similar/different concepts
   - Advantages/disadvantages
   - Complementary technologies

5. **Interview Preparation**
   - 15-20 common interview questions
   - Detailed answers with examples
   - Common pitfalls and best practices

6. **Learning Resources**
   - Recommended books/papers
   - Online tutorials/courses
   - Practice exercises

Format response in Markdown with clear section headings, code blocks (\`\`\`language), bullet points, and emphasis where needed.`;
  };

  const handleTopicClick = async (topic) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
      const response = await axios.post(`${backendUrl}/api/ask-ai`, {
        prompt: generatePrompt(topic)
      });
      setAIResponse(response.data.response);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setError("Failed to fetch response. Please try again later.");
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
        <div className="content-wrapper">
          <div className="content">
            <Sidebar onTopicClick={handleTopicClick} />
            <div className="main-content">
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <ResponseSection 
                        selectedTopic={selectedTopic} 
                        aiResponse={aiResponse}
                        isLoading={isLoading}
                        error={error}
                      />
                      <AboutUs />
                      <FAQs />
                      <Footer />
                    </>
                  }
                />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/faqs" element={<FAQs />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
