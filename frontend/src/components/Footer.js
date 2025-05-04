import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} CsGpt. All rights reserved.</p>
      <p>Made for learners, by learners.</p>
      <div className="social-links">
        <a href="https://github.com/Vaibhavlanjewar" target="_blank" rel="noopener noreferrer">
          <img src="https://img.icons8.com/?size=100&id=118553&format=png&color=000000" alt="GitHub" className="social-icon" />
        </a>
        <a href="https://www.linkedin.com/in/vaibhavlanjewar" target="_blank" rel="noopener noreferrer">
          <img src="https://img.icons8.com/?size=100&id=108812&format=png&color=000000" alt="LinkedIn" className="social-icon" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
