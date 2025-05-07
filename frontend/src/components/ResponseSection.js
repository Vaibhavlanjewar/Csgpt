// ResponseSection.jsx
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

    const styleSheet = document.createElement("style");
    styleSheet.textContent = `...`; // Place the style text here as in the previous message

    const wrapper = document.createElement("div");
    wrapper.style.padding = "30px";
    wrapper.style.backgroundColor = "#ffffff";
    wrapper.appendChild(styleSheet);

    const heading = document.createElement("h1");
    heading.innerText = "CSGPT Notes";
    heading.className = "response-title";
    wrapper.appendChild(heading);
    wrapper.appendChild(clonedNode);

    document.body.appendChild(wrapper);

    html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      while (heightLeft > 0) {
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
        if (heightLeft > 0) {
          pdf.addPage();
          position = 0;
        }
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
