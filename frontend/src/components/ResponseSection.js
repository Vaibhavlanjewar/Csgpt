// src/components/ResponseSection.js
import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "../styles/ResponseSection.css";

const ResponseSection = ({ selectedTopic, aiResponse }) => {
  const [parsedContent, setParsedContent] = useState([]);
  const responseRef = useRef(null);

  useEffect(() => {
    if (!aiResponse) return;

    const lines = aiResponse.split("\n");
    const components = [];

    let inCodeBlock = false;
    let codeBuffer = [];
    let listBuffer = [];
    let tableBuffer = [];

    const flushList = (key) => {
      if (listBuffer.length) {
        components.push(
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
          .map(row => row.split("|").map(cell => cell.trim()).filter(Boolean));
        const [header, ...body] = rows;

        components.push(
          <table key={`table-${key}`} className="response-table">
            <thead>
              <tr>{header.map((head, idx) => <th key={`th-${idx}`}>{head}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((row, rIdx) => (
                <tr key={`tr-${rIdx}`}>
                  {row.map((cell, cIdx) => <td key={`td-${rIdx}-${cIdx}`}>{cell}</td>)}
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

      // Code block start/end
      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          components.push(
            <pre key={`code-${idx}`}><code>{codeBuffer.join("\n")}</code></pre>
          );
          codeBuffer = [];
        }
        inCodeBlock = !inCodeBlock;
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Table handling
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        flushList(idx);
        tableBuffer.push(trimmed);
        return;
      } else if (tableBuffer.length > 0) {
        flushTable(idx);
      }

      // Headings (Markdown)
      if (/^#+\s/.test(trimmed)) {
        flushList(idx);
        const clean = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "");
        components.push(<h4 key={`h4-${idx}`}>{clean}</h4>);
        return;
      }

      // Numbered questions with bold
      const numMatch = trimmed.match(/^\d+\.\s*\*\*(.*?)\*\*/);
      if (numMatch) {
        flushList(idx);
        components.push(<h4 key={`num-${idx}`}>{numMatch[1]}</h4>);
        const desc = trimmed.replace(/^\d+\.\s*\*\*(.*?)\*\*\s*:*/, "").trim();
        if (desc) components.push(<p key={`desc-${idx}`}>{desc}</p>);
        return;
      }

      // Bullet list
      if (trimmed.startsWith("* ")) {
        listBuffer.push(trimmed.slice(2).replace(/\*\*/g, ""));
        return;
      }

      flushList(idx);

      // Inline code: `code`
      const parts = trimmed.split(/(`[^`]+`)/g).map((part, idx) =>
        part.startsWith("`") && part.endsWith("`")
          ? <code key={`code-${idx}`}>{part.slice(1, -1)}</code>
          : part
      );

      if (trimmed) {
        components.push(<p key={`p-${idx}`}>{parts}</p>);
      }
    });

    flushList("end");
    flushTable("end");
    setParsedContent(components);
  }, [aiResponse]);

  const copyToClipboard = () => {
    if (!responseRef.current) return;
    navigator.clipboard.writeText(responseRef.current.innerText).then(() =>
      alert("Response copied to clipboard")
    );
  };

  const downloadPDF = () => {
    if (!responseRef.current) return;
    html2canvas(responseRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = {
        width: pdf.internal.pageSize.getWidth(),
        height: (canvas.height * pdf.internal.pageSize.getWidth()) / canvas.width,
      };

      let heightLeft = imgProps.height;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgProps.width, imgProps.height);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position = heightLeft - imgProps.height;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgProps.width, imgProps.height);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`${selectedTopic || "notes"}.pdf`);
    });
  };

  return (
    <div className="response-section">
      <div className="selected-topic">
        <h3>Selected Topic:</h3>
        <p>{selectedTopic || "None"}</p>
      </div>

      <h3>AI Response:</h3>
      <div className="response-controls">
        <button onClick={copyToClipboard}>📋 Copy</button>
        <button onClick={downloadPDF}>📄 Download PDF</button>
      </div>

      <div ref={responseRef} className="response">
        {parsedContent}
      </div>
    </div>
  );
};

export default ResponseSection;
