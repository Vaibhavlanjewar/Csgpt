import React, { useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import subjectsData from "../data/subjects.json";
import "../styles/Sidebar.css";

const Sidebar = ({ onTopicClick }) => {
  const [openSubjectIndex, setOpenSubjectIndex] = useState(null);

  const toggleSubject = (index) => {
    setOpenSubjectIndex(openSubjectIndex === index ? null : index);
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar">
        <div className="heading-sidebar">
          <h2>Subjects</h2>
        </div>
        <ul className="sidebar-list">
          {subjectsData.subjects.map((subject, index) => {
            const isOpen = openSubjectIndex === index;
            return (
              <li key={index} className="subject-item">
                <div
                  className="subject-header"
                  onClick={() => toggleSubject(index)}
                >
                  <span>{subject.name}</span>
                  {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                </div>
                {isOpen && (
                  <ul className="subtopics">
                    {subject.topics.map((topic, idx) => (
                      <li
                        className="topic-item"
                        key={idx}
                        onClick={() => onTopicClick(topic)}
                      >
                        {topic}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
