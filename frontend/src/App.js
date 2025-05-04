import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";

import AuthForm from "./components/AuthForm";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ResponseSection from "./components/ResponseSection";
// import ProgressTracker from "./components/ProgressTracker";
import AboutUs from "./components/AboutUs";
import FAQs from "./components/FAQs";
import Footer from "./components/Footer";

import "./styles/App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [aiResponse, setAIResponse] = useState("");
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleTopicClick = async (topic) => {
    setSelectedTopic(topic);
    const prompt = `You are an AI-powered educational assistant built to help Computer Science students, interviewees, and professionals deeply understand technical topics.

    Please explain the topic: **"${topic}"** with the following structure and depth:

    1. ✅ **Analogy-Based Introduction**
       - Start with a beginner-friendly analogy or metaphor that simplifies the topic.
       - Make it relatable for students, researchers, and developers.

    2. ✅ **Detailed Conceptual Theory**
       - Provide structured explanations, including prerequisite knowledge.
       - Add variations, real-world applications in academia & industry.

    3. ✅ **Code Examples in Multiple Languages**
       - Show practical implementations in **Python, Java, C++, and C, and SQL if required in database and SQL questions**.
       - For each snippet, explain logic and purpose.

    4. ✅ **Important Conceptual Notes**
       - Summarize 8–10 critical takeaways, formulas, key points.

    5. ✅ **25+ Common Interview Questions and Answers**
       - List 25+ technical interview questions.
       - Explain detailed answers with code and reasoning.

    6. ✅ **Bonus (Optional)**
       - Include simple visuals, ASCII diagrams, pseudocode or flowcharts if helpful.
       - Suggest further reading or tools if relevant.

    🧠 Format the entire content in **clear Markdown** using headings, lists, code blocks (\`\`\`), and emphasis.

    🎯 Suitable for:
    - University learners
    - Technical interview prep
    - Self-paced AI learning`;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/ask-ai`,
        { prompt }
      );
      setAIResponse(response.data.response);
      setProgress((prevProgress) => (prevProgress + 10) % 100);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setAIResponse("Failed to fetch AI response.");
    }
  };

  if (!isAuthenticated) {
    return <AuthForm onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div className="App">
        <Navbar onLogout={() => setIsAuthenticated(false)} />
        <div className="content">
          <Sidebar onTopicClick={handleTopicClick} />
          <div className="main-content" style={{ overflowY: "auto", maxHeight: "calc(100vh - 120px)" }}>
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <ResponseSection selectedTopic={selectedTopic} aiResponse={aiResponse} />
                    {/* <ProgressTracker progress={progress} /> */}
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
    </Router>
  );
}

export default App;
