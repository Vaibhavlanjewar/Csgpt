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

const generatePrompt = (selectedTopic) => {
  return `
You are CsGpt and an expert AI mentor for computer science students and interview aspirants.

The topic to explain in detail is: **${selectedTopic}**

Your output should follow this exact structure:

---

1. **🧠 Theory in Brief**  
   - Explain the topic clearly and concisely.  
   - Cover core definitions, key concepts, and real-world relevance.  
   - Use bullet points, subheadings, or short paragraphs for clarity.  
   - Include diagrams or comparisons in text format if helpful.

2. **💻 Code Examples**  
   - Show code implementations in Java, Python, C++, and C where possible.  
   - Include brief comments explaining each part.  
   - Code should directly relate to the theory above.

3. **📊 Tables, Lists, or Diagrams**  
   - Use tables or bullet points to compare features, list types, or clarify structures.  
   - Diagrams (text-form like flowcharts or trees) are highly encouraged where useful.

4. **❓ 25–30 In-depth Q&A Section**  
   - List 25–30 important questions related to **${selectedTopic}**.  
   - For each question, give a **detailed, well-reasoned answer** with examples or mini code when needed.  
   - Include a variety of:
     - 📘 *Academic* questions
     - 💼 *Interview* questions
     - ⚙️ *Conceptual Analysis* questions  
   - Mention the level: **Basic / Intermediate / Advanced**.

5. **📝 Important Notes Summary**  
   - List the most crucial points as a final recap.  
   - Prefer mindmaps, step-wise flows, or checklists if applicable.  
   - Make it suitable for quick revision before exams or interviews.

6. **⚠️ Common Mistakes & 💡 Industry Applications**  
   - Mention common misunderstandings students make.  
   - List real-world scenarios or use-cases where this concept is applied in companies.

7. **📚 References**  
   - Include standard textbooks, documentation links, or online trusted resources related to the topic.

---

🛠️ Format your response using markdown-style structure.  
🎯 The tone should be friendly, clear, and suitable for both final-year students and technical interview preparation (TCS, Infosys, Cognizant, Amazon, etc.).

Only respond about the topic: **${selectedTopic}**
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
