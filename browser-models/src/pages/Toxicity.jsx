import { useEffect, useState } from "react";
import * as toxicity from "@tensorflow-models/toxicity";
import "@tensorflow/tfjs";

function App() {
  const [model, setModel] = useState(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      const threshold = 0.9; 
      const m = await toxicity.load(threshold);
      setModel(m);
    };
    loadModel();
  }, []);

  const analyzeText = async () => {
    if (!model || !input.trim()) return;
    setLoading(true);
    const predictions = await model.classify([input]);
    setResult(predictions);
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>Toxicity Detector</h1>
      <textarea
        rows="4"
        cols="60"
        placeholder="Type a sentence..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <br />
      <button onClick={analyzeText} disabled={loading || !model}>
        {loading ? "loading..." : "Check"}
      </button>

      {result && (
        <div style={{ marginTop: "1rem" }}>
          <h2>Results:</h2>
          <ul>
            {result.map((r) => (
              <li key={r.label}>
                <strong>{r.label}:</strong>{" "}
                {r.results[0].match ? "Toxic" : "Not toxic"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
