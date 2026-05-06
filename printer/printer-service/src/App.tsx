import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [selected, setSelected] = useState("");
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    running: false,
    port: 3001,
  });

  useEffect(() => {
    // load printers
    window.printerAPI.getPrinters().then(setPrinters);

    // load saved printer
    window.printerAPI.getSavedPrinter().then((saved) => {
      if (saved) setSelected(saved);
    });

    // load server status
    window.printerAPI.getServerStatus().then(setServerStatus);
  }, []);

  const handleSelect = (name: string) => {
    setSelected(name);
    window.printerAPI.savePrinter(name);
  };

  const toggleServer = async () => {
    const status = await window.printerAPI.toggleServer();
    setServerStatus(status);
  };

  const [testData, setTestData] = useState({
    hospital: "City General Hospital",
    patient: "John Doe",
    doctor: "Dr. Smith",
    token: "A-101",
    department: "Cardiology",
    logo: "", // Optional base64 or URL
  });

  const handleTestPrint = async () => {
    if (!serverStatus.running) {
      alert("Please start the server first!");
      return;
    }
    if (!selected) {
      alert("Please select a printer first!");
      return;
    }
    try {
      const serverURL =
        serverStatus.url || `http://127.0.0.1:${serverStatus.port}`;
      const res = await fetch(`${serverURL}/print`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Print failed: ${data || "Unknown error"}`);
        return;
      }
      alert(data.status || "Test print sent!");
    } catch (err) {
      console.error("Print error:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      alert(`Failed to connect to print server: ${errorMsg}`);
    }
  };

  return (
    <div className="container">
      <header className="status-bar">
        <div className="status-info">
          <span
            className={`status-dot ${serverStatus.running ? "online" : "offline"}`}
          ></span>
          <span className="status-text">
            {serverStatus.running
              ? `Server Running: ${serverStatus.url || `http://127.0.0.1:${serverStatus.port}`}`
              : "Server Stopped"}
          </span>
        </div>
        <button
          className={`btn-toggle ${serverStatus.running ? "btn-stop" : "btn-start"}`}
          onClick={toggleServer}
        >
          {serverStatus.running ? "Stop Service" : "Start Service"}
        </button>
      </header>

      <main className="main-content">
        <section className="printer-section">
          <h2>Available Printers</h2>
          <div className="printer-list">
            {printers.length === 0 && (
              <p className="empty-msg">No printers found.</p>
            )}
            {printers.map((p) => (
              <div
                key={p.name}
                className={`printer-card ${selected === p.name ? "active" : ""}`}
              >
                <div className="printer-info">
                  <span className="printer-icon">🖨️</span>
                  <span className="printer-name">{p.name}</span>
                </div>
                <button
                  className={`btn-select ${selected === p.name ? "selected" : ""}`}
                  onClick={() => handleSelect(p.name)}
                >
                  {selected === p.name ? "Active" : "Select"}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="test-print-section">
          <h2>Test Print</h2>
          <div className="test-form">
            <div className="form-group">
              <label>Hospital</label>
              <input
                type="text"
                value={testData.hospital}
                onChange={(e) =>
                  setTestData({ ...testData, hospital: e.target.value })
                }
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Token</label>
                <input
                  type="text"
                  value={testData.token}
                  onChange={(e) =>
                    setTestData({ ...testData, token: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Dept</label>
                <input
                  type="text"
                  value={testData.department}
                  onChange={(e) =>
                    setTestData({ ...testData, department: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-group">
              <label>Patient</label>
              <input
                type="text"
                value={testData.patient}
                onChange={(e) =>
                  setTestData({ ...testData, patient: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Doctor</label>
              <input
                type="text"
                value={testData.doctor}
                onChange={(e) =>
                  setTestData({ ...testData, doctor: e.target.value })
                }
              />
            </div>
            <button className="btn-test-print" onClick={handleTestPrint}>
              Send Test Print
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
