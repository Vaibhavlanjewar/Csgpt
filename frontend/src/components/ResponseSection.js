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
    /* Main container styling */
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
    
    /* Title styling */
    .response-title {
      font-size: 2rem !important;
      margin-bottom: 2rem !important;
      padding-bottom: 0.75rem !important;
      font-weight: 800 !important;
      background: linear-gradient(90deg, #00d4ff, #7e5bef) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      color: transparent !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
    }
    
    /* Headings */
    .response-heading {
      margin: 2rem 0 1.25rem !important;
      font-weight: 700 !important;
    }
    .response-heading:nth-of-type(1) { 
      font-size: 1.8rem !important; 
      color: #7ee8fa !important; 
    }
    .response-heading:nth-of-type(2) { 
      font-size: 1.5rem !important; 
      color: #93c5fd !important; 
    }
    .response-heading:nth-of-type(3) { 
      font-size: 1.3rem !important; 
      color: #a5b4fc !important; 
    }
    .response-heading:nth-of-type(4) { 
      font-size: 1.1rem !important; 
      color: #c7d2fe !important; 
    }
    
    /* Paragraphs and text */
    .response-paragraph {
      margin-bottom: 1.25rem !important;
      color: #e0f7ff !important;
    }
    
    /* Lists */
    .response-list {
      margin: 1.25rem 0 1.25rem 2rem !important;
      list-style-type: disc !important;
    }
    .response-list li {
      margin-bottom: 0.75rem !important;
      color: #e0f7ff !important;
    }
    
    /* Code blocks */
    .code-block {
      background: linear-gradient(135deg, #1e293b, #0f172a) !important;
      color: #f0fdfa !important;
      padding: 1.25rem !important;
      border-radius: 8px !important;
      margin: 2rem 0 !important;
      font-family: 'Fira Code', 'Courier New', monospace !important;
      font-size: 0.95rem !important;
      line-height: 1.6 !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3) !important;
    }
    
    /* Tables */
    .response-table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 2rem 0 !important;
      background: rgba(255, 255, 255, 0.05) !important;
      border-radius: 8px !important;
      overflow: hidden !important;
    }
    .response-table th,
    .response-table td {
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      padding: 1rem !important;
      text-align: left !important;
    }
    .response-table th {
      background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
      color: white !important;
      font-weight: 700 !important;
    }
    .response-table tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.03) !important;
    }
    
    /* Header section */
    .response-header {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      margin-bottom: 2rem !important;
      padding-bottom: 1.25rem !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
    }
    .selected-topic {
      font-size: 1.2rem !important;
      display: flex !important;
      align-items: center !important;
    }
    .selected-label {
      color: #a5b4fc !important;
      margin-right: 0.75rem !important;
      font-weight: 500 !important;
    }
    .topic-name {
      background: linear-gradient(90deg, #00d4ff, #7e5bef) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      color: transparent !important;
      font-weight: 700 !important;
      font-size: 1.3rem !important;
    }
    
    /* Hide action buttons in PDF */
    .action-buttons {
      display: none !important;
    }
    
    /* Ensure fonts are loaded */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code&display=swap');
  `;

  // Create a wrapper div to hold our content and styles
  const wrapper = document.createElement("div");
  wrapper.className = "response-section";
  wrapper.appendChild(styleSheet);
  wrapper.appendChild(clonedNode);

  // Set dimensions and styling for PDF
  wrapper.style.width = "900px";
  wrapper.style.margin = "0 auto";
  wrapper.style.padding = "30px";
  wrapper.style.backgroundColor = "#0f0c29";

  // Temporarily add to document for rendering
  document.body.appendChild(wrapper);

  // Use html2canvas with enhanced settings
  html2canvas(wrapper, {
    scale: 3, // Higher scale for better quality
    useCORS: true,
    backgroundColor: "#0f0c29",
    logging: false,
    allowTaint: true,
    letterRendering: true,
    onclone: (clonedDoc) => {
      // Ensure fonts are loaded in the cloned document
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
    
    // Add additional pages if content is too long
    let heightLeft = imgHeight;
    let position = 10;
    let pageCount = 1;
    
    while (heightLeft >= pdfHeight - 20 && pageCount < 10) {
      position = heightLeft - (pdfHeight - 20);
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, -position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);
      pageCount++;
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
