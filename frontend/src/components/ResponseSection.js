import React, { useState, useEffect, useRef } from "react";
import { FaCopy, FaFileDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../styles/ResponseSection.css";

const ResponseSection = ({ selectedTopic, aiResponse, isLoading }) => {
  const [parsedResponse, setParsedResponse] = useState([]);
  const responseRef = useRef(null);

  useEffect(() => {
    if (!aiResponse) return;

    const lines = aiResponse.split("\n");
    const elements = [];
    let inCodeBlock = false;
    let codeBuffer = [];
    let listBuffer = [];
    let tableBuffer = [];

    const flushList = (key) => {
      if (listBuffer.length > 0) {
        elements.push(
          <ul key={`ul-${key}`} className="response-list">
            {listBuffer.map((item, idx) => (
              <li key={`li-${key}-${idx}`}>{item}</li>
            ))}
          </ul>
        );
        listBuffer = [];
      }
    };

    const flushTable = (key) => {
      if (tableBuffer.length > 0) {
        const rows = tableBuffer
          .map((row) =>
            row
              .split("|")
              .map((cell) => cell.trim())
              .filter(Boolean)
          );
        const header = rows[0];
        const body = rows.slice(1);
        elements.push(
          <table key={`table-${key}`} className="response-table">
            <thead>
              <tr>
                {header.map((head, idx) => (
                  <th key={`th-${key}-${idx}`}>{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rIdx) => (
                <tr key={`tr-${key}-${rIdx}`}>
                  {row.map((cell, cIdx) => (
                    <td key={`td-${key}-${rIdx}-${cIdx}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
        tableBuffer = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("```") && !inCodeBlock) {
        flushList(idx);
        flushTable(idx);
        inCodeBlock = true;
        return;
      } else if (trimmed.startsWith("```") && inCodeBlock) {
        elements.push(
          <pre key={`code-${idx}`} className="code-block">
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        flushList(idx);
        tableBuffer.push(trimmed);
        return;
      } else if (tableBuffer.length > 0) {
        flushTable(idx);
      }

      if (/^#+\s/.test(trimmed)) {
        flushList(idx);
        const level = (trimmed.match(/#/g) || []).length;
        const clean = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "");
        const HeadingTag = `h${Math.min(6, level)}`;
        elements.push(
          React.createElement(
            HeadingTag,
            { key: `heading-${idx}`, className: "response-heading" },
            clean
          )
        );
        return;
      }

      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        listBuffer.push(trimmed.slice(2).replace(/\*\*/g, ""));
        return;
      }

      flushList(idx);
      if (trimmed) {
        elements.push(
          <p key={`p-${idx}`} className="response-paragraph">
            {trimmed.replace(/\*\*/g, "")}
          </p>
        );
      }
    });

    flushList("end");
    flushTable("end");

    setParsedResponse(elements);
  }, [aiResponse]);

  const copyToClipboard = () => {
    if (!responseRef.current) return;
    const text = responseRef.current.innerText;
    navigator.clipboard.writeText(text).then(() => {
      alert("Response copied to clipboard!");
    });
  };

  const downloadPDF = () => {
    if (!responseRef.current) return;

    const input = responseRef.current;
    const clonedNode = input.cloneNode(true);

    // Create a style element with all our CSS
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      .response-section {
        background: linear-gradient(135deg, #0f0c29, #302b63, #24243e) !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
        padding: 2.5rem !important;
        margin: 0 auto !important;
        max-width: 900px !important;
        font-family: 'Inter', 'Segoe UI', system-ui, sans-serif !important;
        color: #e0f7ff !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
      
      /* Enhanced title styling */
      .response-title {
        font-size: 2rem !important;
        margin-bottom: 2rem !important;
        padding-bottom: 0.75rem !important;
        font-weight: 800 !important;
        color: #F0E6A8 !important;
        position: relative;
        text-shadow: 0 0 8px rgba(0, 212, 255, 0.5);
      }
      .response-title::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, #00d4ff, #7e5bef) !important;
      }
      
      /* Enhanced heading styling */
      .response-heading {
        margin: 2rem 0 1.25rem !important;
        font-weight: 700 !important;
        position: relative;
        padding-left: 1.5rem !important;
      }
      .response-heading::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0.25em;
        height: 0.8em;
        width: 5px;
        border-radius: 3px;
      }
      .response-heading:nth-of-type(1) { 
        font-size: 1.8rem !important; 
        color: #7ee8fa !important; 
      }
      .response-heading:nth-of-type(1)::before {
        background: #7ee8fa !important;
      }
      .response-heading:nth-of-type(2) { 
        font-size: 1.5rem !important; 
        color: #93c5fd !important; 
      }
      .response-heading:nth-of-type(2)::before {
        background: #93c5fd !important;
      }
      .response-heading:nth-of-type(3) { 
        font-size: 1.3rem !important; 
        color: #a5b4fc !important; 
      }
      .response-heading:nth-of-type(3)::before {
        background: #a5b4fc !important;
      }
      .response-heading:nth-of-type(4) { 
        font-size: 1.1rem !important; 
        color: #c7d2fe !important; 
      }
      .response-heading:nth-of-type(4)::before {
        background: #c7d2fe !important;
      }
      
      /* Rest of your styles... */
      .response-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      }
      .selected-topic {
        font-size: 1.2rem;
        display: flex;
        align-items: center;
      }
      .selected-label {
        color: #a5b4fc;
        margin-right: 0.75rem;
        font-weight: 500;
      }
      .topic-name {
        color: #00d4ff;
        font-weight: 700;
        font-size: 1.3rem;
      }
      .action-buttons {
        display: flex;
        gap: 1rem;
      }
      .response-content {
        line-height: 1.8;
        font-size: 1.05rem;
      }
      .response-paragraph {
        margin-bottom: 1.25rem;
        color: #e0f7ff;
      }
      .response-list {
        margin: 1.25rem 0 1.25rem 2rem;
        list-style-type: disc;
      }
      .response-list li {
        margin-bottom: 0.75rem;
        color: #e0f7ff;
      }
      .code-block {
        background: linear-gradient(135deg, #1e293b, #0f172a);
        color: #f0fdfa;
        padding: 1.25rem;
        border-radius: 8px;
        overflow-x: auto;
        margin: 2rem 0;
        font-family: 'Fira Code', 'Courier New', monospace;
        font-size: 0.95rem;
        line-height: 1.6;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
      }
      .response-table {
        width: 100%;
        border-collapse: collapse;
        margin: 2rem 0;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        overflow: hidden;
      }
      .response-table th,
      .response-table td {
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 1rem;
        text-align: left;
      }
      .response-table th {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        font-weight: 700;
      }
      .response-table tr:nth-child(even) {
        background: rgba(255, 255, 255, 0.03);
      }
      @media print {
        .action-buttons {
          display: none !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;

    const wrapper = document.createElement("div");
    wrapper.className = "response-section";
    wrapper.appendChild(styleSheet);
    wrapper.appendChild(clonedNode);

    // Enhance elements for PDF
    const enhanceElements = () => {
      // Add decorative elements to headings
      const headings = wrapper.querySelectorAll('.response-heading');
      headings.forEach(heading => {
        const decorator = document.createElement("span");
        decorator.style.position = "absolute";
        decorator.style.left = "0";
        decorator.style.top = "0.25em";
        decorator.style.height = "0.8em";
        decorator.style.width = "5px";
        decorator.style.borderRadius = "3px";
        
        if (heading.classList.contains('response-heading')) {
          const level = parseInt(heading.tagName.charAt(1));
          const colors = ['#7ee8fa', '#93c5fd', '#a5b4fc', '#c7d2fe'];
          decorator.style.background = colors[level - 1] || '#7ee8fa';
        }
        
        heading.insertBefore(decorator, heading.firstChild);
      });

      // Ensure topic name has proper color
      const topicName = wrapper.querySelector('.topic-name');
      if (topicName) {
        topicName.style.backgroundImage = 'none';
        topicName.style.color = '#00d4ff';
      }
    };

    enhanceElements();

    // Set dimensions and styling for PDF
    wrapper.style.width = "900px";
    wrapper.style.margin = "0 auto";
    wrapper.style.padding = "30px";
    wrapper.style.backgroundColor = "#0f0c29";

    document.body.appendChild(wrapper);

    html2canvas(wrapper, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      backgroundColor: "#0f0c29",
      logging: false,
      allowTaint: true,
      letterRendering: true,
      onclone: (clonedDoc) => {
        // Ensure fonts are loaded
        const style = clonedDoc.createElement("style");
        style.textContent = `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Fira+Code&display=swap');
        `;
        clonedDoc.head.appendChild(style);
      }
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // Add margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      
      // Add additional pages if needed
      let heightLeft = imgHeight - (pdfHeight - 20);
      let position = 10;
      while (heightLeft >= 0) {
        position = heightLeft - (pdfHeight - 20);
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }

      pdf.save(`${selectedTopic || "csgpt-notes"}.pdf`);
      document.body.removeChild(wrapper);
    });
  };

  return (
    <div className="response-section">
      <div className="response-header">
        <div className="selected-topic">
          <span className="selected-label">Selected Topic:</span>
          <span className="topic-name">{selectedTopic || "No topic selected"}</span>
        </div>
        <div className="action-buttons">
          <button 
            className="action-button copy-button"
            onClick={copyToClipboard}
            disabled={!aiResponse || isLoading}
          >
            <FaCopy className="button-icon" />
            Copy Response
          </button>
          <button 
            className="action-button download-button"
            onClick={downloadPDF}
            disabled={!aiResponse || isLoading}
          >
            <FaFileDownload className="button-icon" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="response-content" ref={responseRef}>
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Generating response...</p>
          </div>
        ) : aiResponse ? (
          <>
            <h1 className="response-title">{selectedTopic}: A Deep Dive</h1>
            <div className="response-body">{parsedResponse}</div>
          </>
        ) : (
          <p className="empty-state">Select a topic to view the AI response</p>
        )}
      </div>
    </div>
  );
};

export default ResponseSection;
