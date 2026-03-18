import React, { useState } from "react";
import * as XLSX from "xlsx";
import PptxGenJS from "pptxgenjs";
import "./styles.css";
import { toCamelCase } from "./utils/camelCase";

export default function App() {
  const [classes, setClasses] = useState({});
  const [errors, setErrors] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];

        const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (raw.length === 0) throw new Error("Empty file");

        const grouped = {};
        const errs = [];

        raw.forEach((row, index) => {
          const name = row.Name || row.name || row["NAME"];
          const cls = row.Class || row.class || row["CLASS"];

          const cleanName = name?.toString().trim();
          const cleanClass = cls?.toString().trim();

          if (!cleanName || !cleanClass) {
            errs.push(`Row ${index + 2}: Missing Name or Class`);
            return;
          }

          if (!grouped[cleanClass]) grouped[cleanClass] = [];

          if (!grouped[cleanClass].includes(cleanName)) {
            grouped[cleanClass].push(cleanName);
          } else {
            errs.push(`Duplicate: ${cleanName} (${cleanClass})`);
          }
        });

        setClasses(grouped);
        setErrors(errs);
        setActiveTab(Object.keys(grouped)[0] || null);
      } catch (err) {
        console.error(err);
        setErrors(["Failed to parse file. Ensure headers are Name and Class."]);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const generatePPT = () => {
    const pptx = new PptxGenJS();

    Object.entries(classes).forEach(([cls, students]) => {
      const slide = pptx.addSlide();

      slide.addText("Seating Plan for " + cls, {
        x: 0,
        y: 0.3,
        w: "100%",
        align: "center",
        fontSize: 24,
        bold: true,
      });

      const ROWS = 5;
      const COLS = 6;

      const sorted = [...students].sort((a, b) => a.localeCompare(b));

      const table = Array.from({ length: ROWS }, () =>
        Array(COLS).fill({ text: "" }),
      );

      for (let i = 0; i < sorted.length; i++) {
        const col = Math.floor(i / ROWS);
        const isReverse = col % 2 === 1; // odd columns go bottom to top
        const row = isReverse ? ROWS - 1 - (i % ROWS) : i % ROWS;
        const name = sorted[i] || "";
        table[row][col] = { text: name ? toCamelCase(name) : "" };
      }

      slide.addTable(table, {
        x: 0.5,
        y: 1.2,
        w: 9,
        border: { pt: 1, color: "000000" },
      });
    });

    pptx.writeFile({ fileName: "class-list.pptx" });
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const data = [
      { Name: "John Doe", Class: "IT2301" },
      { Name: "Jane Tan", Class: "IT2301" },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "student-template.xlsx");
  };

  return (
    <div>
      <h1>Exam Seating Plan Generator</h1>
      <div className="instructions">
        <h2>Instructions</h2>
        <ol>
          <li>
            Download the template file using the{" "}
            <strong>Download Template</strong> button.
          </li>
          <li>
            Fill in the student names and classes in the template. Each row must
            have a <strong>Name</strong> and a <strong>Class</strong>.
          </li>
          <li>
            Upload the filled template using the <strong>Choose File</strong>{" "}
            button.
          </li>
          <li>Review the students per class in the tabs below.</li>
          <li>
            Click <strong>Generate PowerPoint</strong> to download the class
            list slides.
          </li>
        </ol>
      </div>
      <button className="template-btn" onClick={downloadTemplate}>
        Download Template
      </button>
      <input
        className="template-btn"
        type="file"
        accept=".xlsx,.csv"
        onChange={handleFileUpload}
      />

      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      )}

      {Object.keys(classes).length > 0 && (
        <>
          <div
            className="tab-container"
            style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
          >
            {Object.keys(classes).map((cls) => (
              <button
                key={cls}
                className={`tab-btn ${activeTab === cls ? "active" : ""}`}
                onClick={() => setActiveTab(cls)}
              >
                {cls} ({classes[cls].length})
              </button>
            ))}
          </div>

          {activeTab && (
            <div style={{ overflowY: "auto" }}>
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Class</th>
                  </tr>
                </thead>
                <tbody>
                  {classes[activeTab].map((name, i) => (
                    <tr key={i}>
                      <td>{name}</td>
                      <td>{activeTab}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button className="generate-btn" onClick={generatePPT}>
            Generate PowerPoint
          </button>
        </>
      )}
    </div>
  );
}
