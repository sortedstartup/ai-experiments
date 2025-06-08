import React, { useState } from "react";

export default function Transformers() {
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");
  const [embedding, setEmbedding] = useState([]);
  const [loading, setLoading] = useState(false);

  const runModels = async () => {
    setLoading(true);
    const { pipeline } = await import("@huggingface/transformers");

    const embed = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      quantized: true,
      dtype: 'q8'
    });
    const translate = await pipeline("text2text-generation", "Xenova/t5-small", {
      quantized: true,
      dtype: 'q8'
    });

    const embResult = await embed(text, { pooling: "mean", normalize: true });
    const transResult = await translate("translate English to German: '" + text + "'"); //change language here

    setEmbedding(embResult);
    setTranslated(transResult[0].generated_text);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>Transformers.js ONNX Web Demo</h1>

      <textarea
        style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '0.5rem', border: '1px solid #ccc', marginBottom: '1rem' }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text here"
      />

      <button
        onClick={runModels}
        disabled={loading}
        style={{
          padding: '0.75rem 1.25rem',
          fontSize: '1rem',
          backgroundColor: loading ? '#ccc' : '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '1rem'
        }}
      >
        {loading ? "Running..." : "Run Models"}
      </button>

      {translated && (
        <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'black'}}>Translation:</h2>
          <p style={{color: 'black'}}>{translated}</p>
        </div>
      )}

      {embedding.length > 0 && (
        <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
          <h2 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Sentence Embedding:</h2>
          <pre style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(embedding, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
