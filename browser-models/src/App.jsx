import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Toxicity from './pages/Toxicity';
import Embedding from './pages/Embedding';
import Transformers from './pages/Transformer';
import Image from './pages/Image';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Embedding />} />
          <Route path="/toxic" element={<Toxicity />} />
          <Route path="/toxic" element={<Toxicity />} />
          <Route path="/transformer" element={<Transformers />} />
          <Route path="/image" element={<Image />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
