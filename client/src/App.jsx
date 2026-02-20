import { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";

/* =========================
   HOME PAGE
========================= */

function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const response = await fetch("http://localhost:5000/reviews");
      const data = await response.json();
      setReviews(data);
    } catch {
      console.log("Failed to fetch reviews");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAnalyze = async () => {
    if (!url) {
      alert("Please enter a URL");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data);
      fetchReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const score = result?.review?.ux_score;

  return (
    <div className="container">
      <h1>AI Website UX Reviewer</h1>
      <p>Paste a website URL below to analyze its UX.</p>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: "400px", marginRight: "12px" }}
        />

        <button onClick={handleAnalyze} style={{ padding: "10px 18px" }}>
          Analyze
        </button>
      </div>

      {loading && <p style={{ marginTop: "20px" }}>Analyzing website...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {result && (
        <>
          <div className="section">
            <h2>UX Score</h2>
            <div
              className={`score-box ${
                score >= 75
                  ? "score-good"
                  : score >= 50
                  ? "score-medium"
                  : "score-low"
              }`}
            >
              {score}
            </div>
          </div>

          <h3 className="section">Issues</h3>
          {result.review?.issues?.map((issue, index) => (
            <div key={index} className="card">
              <strong>Category:</strong> {issue.category} <br />
              <strong>Issue:</strong> {issue.issue} <br />
              <strong>Severity:</strong> {issue.severity} <br />
              <strong>Why:</strong> {issue.why} <br />
              <strong>Proof:</strong> {issue.proof}
            </div>
          ))}

          <h3 className="section">Top Improvements</h3>
          {result.review?.top_fixes?.map((fix, index) => (
            <div key={index} className="card success-card">
              <strong>Issue:</strong> {fix.issue} <br />
              <strong>Before:</strong> {fix.before} <br />
              <strong>After:</strong> {fix.after}
            </div>
          ))}
        </>
      )}

      <h3 className="section">Last 5 Reviews</h3>
      {reviews.map((review, index) => (
        <div key={index} className="card">
          <strong>URL:</strong> {review.url} <br />
          <strong>Score:</strong> {review.score}
        </div>
      ))}
    </div>
  );
}

/* =========================
   STATUS PAGE
========================= */

function Status() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const response = await fetch("http://localhost:5000/health");
      const data = await response.json();
      setStatus(data);
    };

    fetchStatus();
  }, []);

  return (
    <div className="container">
      <h1>System Status</h1>

      {!status && <p>Checking system status...</p>}

      {status && (
        <>
          <div className="card">
            <strong>Backend:</strong> {status.backend}
          </div>
          <div className="card">
            <strong>Database:</strong> {status.database}
          </div>
          <div className="card">
            <strong>LLM:</strong> {status.llm}
          </div>
          <div className="card">
            <strong>Uptime:</strong> {Math.round(status.uptime)} seconds
          </div>
          <div className="card">
            <strong>Memory Usage:</strong> {status.memoryUsageMB} MB
          </div>
        </>
      )}
    </div>
  );
}

/* =========================
   MAIN APP
========================= */

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/status">Status</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/status" element={<Status />} />
      </Routes>
    </div>
  );
}

export default App;