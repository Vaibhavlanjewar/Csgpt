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
  return `As a Computer Science expert, provide a comprehensive and in-depth explanation of "${topic}" covering the following:

1. **Core Concept**  
   - Clear definition and purpose  
   - Historical background or context (if relevant)

2. **Technical Details**  
   - How it works under the hood  
   - Architectural insights, flowcharts, or system diagrams

3. **Implementation**  
   - Code examples in relevant programming languages (e.g., JavaScript, Python, Java)  
   - Explain each code block line-by-line  
   - Include project setup steps, configurations, and integration tips

4. **Real-world Applications**  
   - Use cases in industry  
   - How companies or domains benefit from this  
   - Example scenarios

5. **Comparative Analysis**  
   - Include tables to compare with alternatives (e.g., Firebase vs Supabase)  
   - Discuss trade-offs and performance considerations

6. **Best Practices and Pitfalls**  
   - Performance optimization techniques  
   - Common mistakes and how to avoid them  
   - Security or scalability considerations

7. **25+ Interview Questions (Grouped by Level)**  
   - Beginner: Basic conceptual questions  
   - Intermediate: Design-oriented or semi-coding  
   - Advanced: Algorithmic, coding-heavy, or real-world problem-solving  
   - Provide code, explanation, and complexity analysis if needed

8. **Project Ideas**  
   - Suggest 3–5 real-world mini-projects or capstone ideas related to the topic

9. **References**  
   - Link to official documentation, tools, blogs, videos, and whitepapers  
   - Mention your expert tips or hidden tricks

10. **Format**  
    - Clean and well-structured Markdown  
    - Use proper headings, code blocks, bullet lists, diagrams, tables, and quotes where helpful  
    - Tone should be professional but easy to follow for beginners and pros alike
`;
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
