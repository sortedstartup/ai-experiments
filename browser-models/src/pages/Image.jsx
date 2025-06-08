import React, { useState } from "react";

export default function TransformersDemoPage() {
  const [imageUrl, setImageUrl] = useState("https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1");
  const [labels, setLabels] = useState(["cats", "dogs", "birds"]);
  const [probabilities, setProbabilities] = useState([]);
  const [loading, setLoading] = useState(false);

  const runModel = async () => {
    setLoading(true);
    const {
      AutoTokenizer,
      CLIPTextModelWithProjection,
      AutoProcessor,
      CLIPVisionModelWithProjection,
      RawImage,
      dot,
      softmax,
    } = await import("@huggingface/transformers");

    const model_id = "Xenova/mobileclip_s0";
    const tokenizer = await AutoTokenizer.from_pretrained(model_id);
    const text_model = await CLIPTextModelWithProjection.from_pretrained(model_id, { dtype: 'q8' });
    const processor = await AutoProcessor.from_pretrained(model_id);
    const vision_model = await CLIPVisionModelWithProjection.from_pretrained(model_id, { dtype: 'q8' });

    const texts = labels;
    const text_inputs = tokenizer(texts, { padding: "max_length", truncation: true });
    const { text_embeds } = await text_model(text_inputs);
    const normalized_text_embeds = text_embeds.normalize().tolist();

    const image = await RawImage.read(imageUrl);
    const image_inputs = await processor(image);
    const { image_embeds } = await vision_model(image_inputs);
    const normalized_image_embeds = image_embeds.normalize().tolist();

    const results = normalized_image_embeds.map((imageEmbed, i) => {
      const similarities = normalized_text_embeds.map(textEmbed => 
        100 * dot(imageEmbed, textEmbed)
      );
      
      const probs = softmax(similarities);
      
      return probs.map((prob, j) => ({ 
        label: texts[j], 
        probability: prob 
      }));
    });

    setProbabilities(results);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>CLIP Image-Text Matching (ONNX Web)</h1>

      <input
        type="text"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="Image URL"
        style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '0.5rem', border: '1px solid #ccc', marginBottom: '1rem' }}
      />

      <input
        type="text"
        value={labels.join(", ")}
        onChange={(e) => setLabels(e.target.value.split(",").map(s => s.trim()))}
        placeholder="Comma-separated labels (e.g. cats, dogs, birds)"
        style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: '0.5rem', border: '1px solid #ccc', marginBottom: '1rem' }}
      />

      <button
        onClick={runModel}
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
        {loading ? "Running..." : "Run CLIP"}
      </button>

      {probabilities.length > 0 && (
        <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
          <h2 style={{ fontWeight: '600', marginBottom: '0.5rem', color: 'black' }}>Probabilities:</h2>
          {probabilities.map((row, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <p style={{ marginBottom: '0.25rem', fontWeight: 'bold', color: 'black' }}>Image {i + 1}</p>
              <ul style={{ marginLeft: '1rem', color: 'black' }}>
                {row.map((entry, j) => (
                  <li key={j}>{entry.label}: {(entry.probability * 100).toFixed(2)}%</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}