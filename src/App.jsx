import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Toxicity from './pages/Toxicity';
import Embedding from './pages/Embedding';
import Onnx from './pages/Onnx';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Embedding />} />
          <Route path="/toxic" element={<Toxicity />} />
          <Route path="/onnx" element={<Onnx />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
