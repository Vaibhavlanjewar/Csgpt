import React, { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../styles/ResponseSection.css";

const ResponseSection = ({ selectedTopic, aiResponse }) => {
  const [parsedResponse, setParsedResponse] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const responseRef = useRef(null);

  useEffect(() => {
    if (!aiResponse) return;

    setIsLoading(true);

    const timeout = setTimeout(() => {
      const lines = aiResponse.split("\n");
      const elements = [];
      let inCodeBlock = false;
      let codeBuffer = [];
      let listBuffer = [];
      let tableBuffer = [];

      const flushList = (key) => {
        if (listBuffer.length > 0) {
          elements.push(
            <ul key={`ul-${key}`}>
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
            <pre key={`code-${idx}`}>
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
          const clean = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "");
          elements.push(<h4 key={`h4-${idx}`}>{clean}</h4>);
          return;
        }

        const numMatch = trimmed.match(/^\d+\.\s*\*\*(.*?)\*\*/);
        if (numMatch) {
          flushList(idx);
          elements.push(<h4 key={`num-${idx}`}>{numMatch[1]}</h4>);
          const desc = trimmed
            .replace(/^\d+\.\s*\*\*(.*?)\*\*\s*:*/, "")
            .trim();
          if (desc) elements.push(<p key={`desc-${idx}`}>{desc}</p>);
          return;
        }

        if (trimmed.startsWith("* ")) {
          listBuffer.push(trimmed.slice(2).replace(/\*\*/g, ""));
          return;
        }

        flushList(idx);
        if (trimmed) {
          elements.push(<p key={`p-${idx}`}>{trimmed.replace(/\*\*/g, "")}</p>);
        }
      });

      flushList("end");
      flushTable("end");

      setParsedResponse(elements);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [aiResponse]);

  const copyToClipboard = () => {
    if (!responseRef.current) return;
    const text = responseRef.current.innerText;
    navigator.clipboard.writeText(text).then(() => {
      alert("Response copied to clipboard");
    });
  };

  const downloadPDF = () => {
    if (!responseRef.current) return;
    html2canvas(responseRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 30;

      pdf.setFontSize(18);
      pdf.setTextColor("#1f2937");
      pdf.text("CSGPT", pdfWidth / 2, 20, { align: "center" });
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`${selectedTopic || "notes"}.pdf`);
    });
  };

  return (
    <div className="response-section">
      <div className="selected-topic">
        <h3>Selected Topic:</h3>
        <p>{selectedTopic}</p>
      </div>

      <h3>AI Response:</h3>

      <div className="response-controls">
        <button className="full-width-button" onClick={copyToClipboard} disabled={isLoading}>
          📋 Copy Response
        </button>
        <button className="full-width-button" onClick={downloadPDF} disabled={isLoading}>
          ⬇️ Download PDF
        </button>
      </div>

      {isLoading ? (
        <div className="loader-wrapper">
          <span className="loader"></span>
          <p className="loading-message">Parsing response, please wait...</p>
        </div>
      ) : (
        <div ref={responseRef} className="response">
          {parsedResponse}
        </div>
      )}
    </div>
  );
};

export default ResponseSection;
