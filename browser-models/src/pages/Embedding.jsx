import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as use from "@tensorflow-models/universal-sentence-encoder";

const Embedding = () => {
  const [model, setModel] = useState(null);
  const [question, setQuestion] = useState("");
  const [similarityScores, setSimilarityScores] = useState([]);
  const [loading, setLoading] = useState(false);

  const responsesArray = [
    "I'm not feeling very well.",
    "Beijing is the capital of China.",
    "You have five fingers on your hand.",
  ];

  useEffect(() => {
    const load = async () => {
      const loadedModel = await use.loadQnA();
      setModel(loadedModel);
      console.log("Model loaded.");
    };
    load();
  }, []);

  const handleSubmit = async () => {
    if (!model || !question.trim()) return;
    setLoading(true);
    setSimilarityScores([]);

    const input = {
      queries: [question],
      responses: responsesArray,
    };

    const embeddings = await model.embed(input);
    const similarityTensor = tf.matMul(
      embeddings.queryEmbedding,
      embeddings.responseEmbedding,
      false,
      true
    );

    const results = await similarityTensor.array();
    const similarityRow = results[0];

    setSimilarityScores(similarityRow);
    setLoading(false);
  };

  const runBenchmark = async () => {
    if (!model) return;
    const TEST_QUERIES = 10;
    const ROUNDS = 1000;

    const dummyInput = {
      queries: Array(TEST_QUERIES).fill("What is the capital of China?"),
      responses: responsesArray,
    };

    await model.embed(dummyInput);

    const t0 = performance.now();
    for (let i = 0; i < ROUNDS; i++) {
        console.log(i);
        
      const embeddings = await model.embed(dummyInput);
      await embeddings.queryEmbedding.data();
      embeddings.queryEmbedding.dispose();
      embeddings.responseEmbedding.dispose();
    }
    const t1 = performance.now();

    const totalEmbeds = TEST_QUERIES * ROUNDS;
    const timeSec = (t1 - t0) / 1000;
    const eps = totalEmbeds / timeSec;

    console.log(`Benchmark: ${eps.toFixed(2)} embeds/sec`);
    alert(`Benchmark: ${eps.toFixed(2)} embeddings/sec`);
  };

  const containerStyle = {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  };

  const buttonStyle = {
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginTop: "10px",
  };

  const resultStyle = {
    marginTop: "20px",
    fontSize: "18px",
  };

  return (
    <div style={containerStyle}>
      <h2>QnA Matcher</h2>
      <input
        type="text"
        placeholder="Ask a question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={inputStyle}
      />
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={handleSubmit} style={buttonStyle} disabled={loading || !model}>
          {loading ? "Searching..." : "Find Answer"}
        </button>
        <button
          onClick={runBenchmark}
          style={{ ...buttonStyle }}
          disabled={!model}
        >
          Run Benchmark
        </button>
      </div>

      {similarityScores.length > 0 && (
        <div style={resultStyle}>
          <strong>Scores:</strong>
          <ul>
            {responsesArray.map((res, idx) => (
              <li key={idx}>
                "{res}" — Score: {similarityScores[idx].toFixed(4)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Embedding;
