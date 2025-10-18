import { useEffect, useState } from "react";
import axios from "axios";

const Badge = ({ label }) => {
  const colors = {
    Inbox: { bg: "#16A34A20", color: "#16A34A" },
    Spam: { bg: "#DC262620", color: "#DC2626" },
    Promotions: { bg: "#F59E0B20", color: "#FBBF24" },
    "Not Received": { bg: "#6B728020", color: "#D1D5DB" },
    Error: { bg: "#B91C1C20", color: "#FCA5A5" },
    Unknown: { bg: "#37415120", color: "#9CA3AF" },
  };
  const style = colors[label] || colors.Unknown;

  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: "4px 10px",
        borderRadius: "9999px",
        fontWeight: 600,
        fontSize: 12,
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {label}
    </span>
  );
};

export default function App() {
  const [inboxes, setInboxes] = useState([]);
  const [results, setResults] = useState([]);
  const [testCode, setTestCode] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRefreshToken, setUserRefreshToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingInboxes, setFetchingInboxes] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("home");
  const [history, setHistory] = useState([]);

  const generateTestCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setTestCode(code);
    setResults([]);
    setError(null);
  };

  useEffect(() => {
    const fetchInboxes = async () => {
      setFetchingInboxes(true);
      try {
        const res = await axios.get("http://localhost:4000/api/inboxes");
        setInboxes(res.data.inboxes || []);
      } catch {
        setError("Unable to load inbox list. Is backend running?");
      } finally {
        setFetchingInboxes(false);
      }
    };
    fetchInboxes();
    generateTestCode();

    const pastHistory = JSON.parse(localStorage.getItem("emailTestHistory") || "[]");
    setHistory(pastHistory);
  }, []);

  const checkEmails = async () => {
    if (!testCode || !userEmail || !userRefreshToken) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await axios.get(
        `http://localhost:4000/api/check-email?testCode=${encodeURIComponent(
          testCode
        )}&userEmail=${encodeURIComponent(
          userEmail
        )}&userRefreshToken=${encodeURIComponent(userRefreshToken)}`
      );
      const newResults = res.data.report.results || [];
      setResults(newResults);
      setView("results");

      const newEntry = {
        testCode,
        timestamp: new Date().toLocaleString(),
        results: newResults,
      };
      const updatedHistory = [newEntry, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem("emailTestHistory", JSON.stringify(updatedHistory));
    } catch (err) {
      console.error(err);
      setError("Error while checking emails. Make sure your refresh token is valid.");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    background: "linear-gradient(to bottom, #0f0f0f, #1a1a1a)",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    fontFamily: "Poppins, sans-serif",
    padding: "50px 0",
  };

  const score = results.filter(r => r.folder === "Inbox").length;
  const total = results.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  // 🏠 Home Page
  if (view === "home") {
    return (
      <div style={containerStyle}>
        <div style={{ width: "85%", maxWidth: 950 }}>
          <div
            style={{
              background: "#111",
              borderRadius: 20,
              padding: 40,
              boxShadow: "0 10px 40px rgba(255, 215, 0, 0.15)",
              border: "1px solid rgba(255,215,0,0.2)",
              textAlign: "center",
            }}
          >
            <h1 style={{
              fontSize: 36,
              fontWeight: 700,
              background: "linear-gradient(90deg, #FFD700, #FFCC00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 10,
            }}>
              ✨ Email Spam Report Tool
            </h1>
            <p style={{ color: "#BBB", fontSize: 16, marginBottom: 30 }}>
              Test where your emails land — <b>Inbox</b>, <b>Spam</b>, or <b>Promotions</b>.
            </p>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #FFD700",
                  background: "#111",
                  color: "#FFD700",
                  width: 250,
                  fontSize: 14,
                  textAlign: "center",
                }}
              />
              <input
                type="text"
                placeholder="Enter Gmail refresh token"
                value={userRefreshToken}
                onChange={e => setUserRefreshToken(e.target.value)}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #FFD700",
                  background: "#111",
                  color: "#FFD700",
                  width: 250,
                  fontSize: 14,
                  textAlign: "center",
                }}
              />
            </div>

            {/* Test Code Card */}
            <div style={{
              background: "#1A1A1A",
              padding: 20,
              borderRadius: 16,
              marginBottom: 25,
              border: "1px solid rgba(255,215,0,0.2)",
              boxShadow: "inset 0 0 20px rgba(255,215,0,0.05)"
            }}>
              <h2 style={{ color: "#FFD700", fontSize: 16, marginBottom: 5 }}>Your Test Code</h2>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#FFF", letterSpacing: 2, marginBottom: 5 }}>{testCode}</div>
              <p style={{ color: "#AAA", fontSize: 13 }}>Include this code in your email subject or body.</p>

              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 10 }}>
                <button onClick={() => { navigator.clipboard.writeText(testCode); alert("Copied!"); }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(90deg,#FFD700,#FFC300)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}>📋 Copy Test Code</button>
                <button onClick={checkEmails} disabled={loading}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: loading ? "#555" : "linear-gradient(90deg,#FFD700,#FFC300)",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}>{loading ? "Checking..." : "🚀 Check Email Status"}</button>
                <button onClick={generateTestCode}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 12,
                    border: "1px solid #FFD700",
                    color: "#FFD700",
                    background: "transparent",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}>🔁 New Code</button>
              </div>
            </div>

            {/* Deliverability Score */}
            {results.length > 0 && (
              <div style={{
                marginBottom: 20,
                padding: 12,
                borderRadius: 12,
                background: "#111",
                color: "#FFD700",
                fontWeight: 600,
              }}>
                Deliverability Score: {score}/{total} inboxes ({percentage}%)
              </div>
            )}

            {/* Test Inboxes */}
            <div style={{ background: "#111", padding: 20, borderRadius: 16, marginBottom: 20 }}>
              <h3 style={{ color: "#FFD700", marginBottom: 12 }}>Test Inboxes</h3>
              {fetchingInboxes ? <p style={{ color: "#AAA" }}>Loading inboxes...</p> :
                inboxes.length === 0 ? <p style={{ color: "#AAA" }}>No inboxes configured.</p> :
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                    {inboxes.map((email, idx) => (
                      <div key={idx} style={{ padding: 10, borderRadius: 10, border: "1px solid #FFD700", color: "#FFF", minWidth: 200 }}>{email}</div>
                    ))}
                  </div>
              }
            </div>

            {/* Past History Chart */}
            {history.length > 0 && (
              <div style={{ background: "#111", padding: 20, borderRadius: 16 }}>
                <h3 style={{ color: "#FFD700", marginBottom: 12 }}>Past Test History</h3>
                {history.map((h, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 150, color: "#AAA", fontSize: 12 }}>{h.timestamp}</div>
                    <div style={{ flex: 1, height: 12, borderRadius: 6, background: "#333", position: "relative" }}>
                      <div style={{
                        width: `${(h.results.filter(r => r.folder === "Inbox").length / h.results.length) * 100}%`,
                        height: "100%",
                        background: "#16A34A",
                        borderRadius: 6,
                      }}></div>
                    </div>
                    <div style={{ color: "#FFD700", fontSize: 12, minWidth: 40, textAlign: "right" }}>
                      {h.results.filter(r => r.folder === "Inbox").length}/{h.results.length}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p style={{ color: "#999", fontSize: 13, marginTop: 20 }}>
              ⏳ After sending the test email, wait ~20–30s then click <span style={{ color: "#FFD700" }}>Check Email Status</span>.
            </p>

            {error && <p style={{ color: "#DC2626", marginTop: 12 }}>{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  // Results Page (simplified, modern)
  if (view === "results") {
    return (
      <div style={containerStyle}>
        <div style={{
          width: "75%",
          maxWidth: 900,
          background: "#111",
          marginTop : 180,
          borderRadius: 20,
          padding: 40,
          boxShadow: "0 10px 40px rgba(255,215,0,0.15)",
          border: "1px solid rgba(255,215,0,0.2)",
          textAlign: "center",
        }}>
          <h1 style={{
            fontSize: 32,
            fontWeight: 700,
            background: "linear-gradient(90deg,#FFD700,#FFCC00)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 20,
          }}>Email Delivery Results</h1>

          {results.length === 0 ? <p style={{ color: "#AAA" }}>No results available. Go back and check again.</p> :
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
              <thead>
                <tr style={{ background: "#1A1A1A" }}>
                  <th style={{ padding: "12px" }}>Inbox</th>
                  <th style={{ padding: "12px" }}>Folder</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,215,0,0.1)" }}>
                    <td style={{ padding: 10, color: "#FFF" }}>{r.email}</td>
                    <td style={{ padding: 10 }}><Badge label={r.folder || "Unknown"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          }

          <button onClick={() => setView("home")} style={{
            marginTop: 30,
            padding: "10px 22px",
            borderRadius: 10,
            background: "transparent",
            border: "1px solid #FFD700",
            color: "#FFD700",
            cursor: "pointer",
            fontWeight: 500
          }}>⬅ Back to Home</button>
        </div>
      </div>
    );
  }
}
