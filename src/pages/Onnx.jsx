import { pipeline } from "@huggingface/transformers";
import { useEffect } from "react";

// MiniLM embeddings
const Onnx = () => {
  useEffect(() => {
    async function random() {
      const embed = await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
        { quantized: true, dtype: 'q8' }
      );
      console.log(
        await embed("Eagle flies high", { pooling: "mean", normalize: true })
      );
    }
    random();
  }, []);

  return (
    <>
      <h1>Hii</h1>
    </>
  );
};
export default Onnx;
