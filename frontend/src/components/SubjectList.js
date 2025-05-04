import React from "react";

const SubjectList = ({ subjects, onTopicClick }) => {
  return (
    <div className="subject-list">
      {subjects.map((subject, index) => (
        <div key={index}>
          <h2>{subject.name}</h2>
          <ul>
            {subject.topics.map((topic, idx) => (
              <li key={idx} onClick={() => onTopicClick(topic)}>
                {topic}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SubjectList;