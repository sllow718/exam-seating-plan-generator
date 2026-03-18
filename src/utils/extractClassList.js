// With this:
import XLSX from "xlsx";
import fs from "fs";

function extractClassList(inputPath, outputPath) {
  const wb = XLSX.readFile(inputPath);
  const ws = wb.Sheets[wb.SheetNames[0]];

  // Convert sheet to array of arrays (raw rows)
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

  const records = [];
  let currentClass = null;

  for (const row of rows) {
    // Detect Subject Group header row
    // col[1] === 'Subject Group', col[3] === ':', col[4] is the class code
    if (row[1] === "Subject Group" && row[3] === ":") {
      currentClass = row[4]; // e.g. "PC01"
    }

    // Detect student row:
    // col[1] is a serial number (digit), col[4] is the student name
    else if (row[1] != null && String(row[1]).trim().match(/^\d+$/) && row[4]) {
      records.push({ name: row[4], class: currentClass });
    }
  }

  // Write output xlsx
  const outputWb = XLSX.utils.book_new();
  const outputWs = XLSX.utils.json_to_sheet(records);
  XLSX.utils.book_append_sheet(outputWb, outputWs, "ClassList");
  XLSX.writeFile(outputWb, outputPath);

  console.log(`Done. ${records.length} students written to ${outputPath}`);
  return records;
}

// Usage
extractClassList("ClassList.xlsx", "output.xlsx");
