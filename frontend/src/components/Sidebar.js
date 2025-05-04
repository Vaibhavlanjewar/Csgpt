import React, { useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa"; // icon library
import subjectsData from "../data/subjects.json";
import "../styles/Sidebar.css";


const Sidebar = ({ onTopicClick }) => {
  const [openSubjectIndex, setOpenSubjectIndex] = useState(null);

  const toggleSubject = (index) => {
    setOpenSubjectIndex(openSubjectIndex === index ? null : index); // close if already open
  };

  return (
    <div className="sidebar">
      <div className="heading-sidebar">
        <h2>Subjects</h2>
      </div>
      <ul>
        {subjectsData.subjects.map((subject, index) => {
          const isOpen = openSubjectIndex === index;
          return (
            <li key={index}>
              <div
                // className="subject-sidebar"
                onClick={() => toggleSubject(index)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{subject.name}</span>
                {isOpen ? <FaChevronDown /> : <FaChevronRight />}
              </div>
              {isOpen && (
                <ul className="subtopics">
                  {subject.topics.map((topic, idx) => (
                    <li
                      className="sub-topics"
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
  );
};

export default Sidebar;
