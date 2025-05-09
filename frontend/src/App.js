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
  return `As a Computer Science expert, provide an in-depth technical guide on the topic: "${topic}" covering the following aspects:

1. **Core Concept**  
   - Provide a clear, concise, and formal definition.
   - Include historical background or origin if relevant.
   - Use examples or analogies to explain intuitively.

2. **Technical Details**  
   - Explain how it works under the hood (internal mechanisms, protocols, algorithms, etc.).
   - Use diagrams or architectural visuals where applicable.
   - Include performance considerations or trade-offs.

3. **Implementation**  
   - Provide step-by-step code examples in relevant programming languages (JavaScript, Python, Java, C++, etc.).
   - Annotate the code thoroughly and explain logic clearly.
   - If applicable, build a small project or module to demonstrate.

4. **Comparisons and Alternatives**  
   - Provide a comparison table of this concept vs alternatives (e.g., Firebase vs Supabase, SQL vs NoSQL, etc.).
   - Highlight use-case-specific recommendations.

5. **Real-world Applications**  
   - Explain where and how this is used in real-world systems (startups, enterprises, tech giants).
   - Include case studies or well-known implementations if possible.

6. **Best Practices & Pitfalls**  
   - List the dos and don’ts while implementing or working with this concept.
   - Include debugging or optimization tips.

7. **Interview Questions (25+)**  
   - Group questions into Beginner, Intermediate, and Advanced levels.
   - For each, provide:
     - A clear question statement.
     - An in-depth answer with explanation.
     - Full code (if needed) and complexity analysis.
   - Make sure the questions are aligned with top tech companies (FAANG, etc.).

8. **Further Reading & References**  
   - Include official documentation links, blog posts, and research papers.
   - Suggest GitHub repositories, tools, or courses for deeper learning.

9. **Bonus: Expert Insights**  
   - Add your own ideas, edge cases, performance tips, or creative uses.
   - Suggest how this topic evolves or what the future trends are.

📝 Format the entire response like a well-structured **Markdown blog post**, using:
- Clear headings and subheadings
- Bullet points and numbered lists
- Code blocks for code samples
- Tables for comparisons
- Diagrams where appropriate (describe the diagram or use Mermaid.js if needed)
- Clean language for beginners yet insightful for professionals

Target audience: developers from beginner to pro, preparing for interviews or building projects.`;
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
