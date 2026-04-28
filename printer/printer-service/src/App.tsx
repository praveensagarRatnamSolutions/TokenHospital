import { useEffect, useState } from "react";

function App() {
  const [printers, setPrinters] = useState<any[]>([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    // load printers
    window.printerAPI.getPrinters().then(setPrinters);

    // load saved printer
    window.printerAPI.getSavedPrinter().then((saved) => {
      if (saved) setSelected(saved);
    });
  }, []);

  const handleSave = () => {
    if (!selected) return alert("Select a printer");
    window.printerAPI.savePrinter(selected);
    alert("Printer saved!");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Select Printer</h2>

      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">Select Printer</option>
        {printers.map((p) => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>

      <br /><br />

      <button onClick={handleSave}>Save Printer</button>
    </div>
  );
}

export default App;