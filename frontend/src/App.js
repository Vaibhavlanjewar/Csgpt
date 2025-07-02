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
  return `You are an expert AI mentor for computer science students and interview aspirants. For the given topic, provide a comprehensive and well-structured explanation including the following sections:

1. **Theory in Brief**  
   - Explain the topic concisely, covering its core concepts and definitions.  
   - Use bullet points or headings where appropriate to improve clarity.  
   - Include diagrams, real-world relevance, or comparisons when useful.

2. **Code Examples**  
   - Provide clear and relatable code examples in **multiple programming languages**: Java, Python, C++, and C.  
   - Each snippet should be well-commented and relevant to the theory.

3. **Tables, Lists, or Diagrams**  
   - Use bullet lists or tables to highlight key differences, advantages/disadvantages, use-cases, or classifications.  
   - Include diagrams in text format where helpful (e.g., process diagrams, stack memory illustrations).

4. **Question and Answer Section (25–30 in-depth)**  
   - Include **25 to 30 important academic + interview questions** based on the topic And for each question, provide a **detailed and well-reasoned answer** with examples, explanations, or illustrations where necessary.Cover **basic, intermediate, and advanced** levels.  
   - Mark each question by purpose:
     - 📘 *Academic*
     - 💼 *Interview*
     - ⚙️ *Conceptual Analysis*

5. **Important Notes Summary**  
   - Provide a concise summary or checklist of key points for last-minute revision with diagram or mindmap or steps .

6. **Common Mistakes & Industry Applications (Optional)**  
   - List frequent misunderstandings students face regarding the topic.  
   - Mention real-world use-cases or how companies apply this concept.

7. **References**  
   - List relevant standard books, documentation links, or trusted online resources used to generate the above content.

Use clear markdown-style formatting, headings, and styling. Ensure the tone is educational, concise, and suitable for both final-year students and interview preparation (e.g., TCS, Infosys, Cognizant, Amazon, etc.).
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
