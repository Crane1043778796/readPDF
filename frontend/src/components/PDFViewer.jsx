import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFViewer = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [highlights, setHighlights] = useState([]);
  const [selection, setSelection] = useState(null);
  const [highlightType, setHighlightType] = useState('1');

  const saveProgress = async () => {
    try {
      await axios.post('/api/save-progress', {
        pageNumber,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('保存进度失败:', error);
    }
  };

  const handleHighlight = () => {
    if (selection) {
      const newHighlight = {
        text: selection,
        page: pageNumber,
        type: highlightType,
      };
      setHighlights([...highlights, newHighlight]);
      saveHighlight(newHighlight);
    }
  };

  const generateMindMap = async () => {
    try {
      const response = await axios.post('/api/generate-mindmap', {
        highlights
      });
      // 处理思维导图数据
    } catch (error) {
      console.error('生成思维导图失败:', error);
    }
  };

  return (
    <div className="pdf-viewer">
      <Document file="your-pdf-file.pdf">
        <Page pageNumber={pageNumber} />
      </Document>
      
      <div className="controls">
        <button onClick={() => setPageNumber(pageNumber - 1)}>上一页</button>
        <button onClick={() => setPageNumber(pageNumber + 1)}>下一页</button>
        <button onClick={saveProgress}>保存进度</button>
        <button onClick={handleHighlight}>标注</button>
        <select value={highlightType} onChange={(e) => setHighlightType(e.target.value)}>
          <option value="1">标注1</option>
          <option value="2">标注2</option>
          <option value="3">标注3</option>
        </select>
        <button onClick={generateMindMap}>生成思维导图</button>
      </div>
    </div>
  );
};

export default PDFViewer;