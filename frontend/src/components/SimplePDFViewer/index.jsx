import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import './styles.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const SimplePDFViewer = () => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfFile, setPdfFile] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const fileUrl = URL.createObjectURL(file);
      setPdfFile(fileUrl);
    }
  };

  return (
    <div className="viewer-container">
      <div className="toolbar">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
        />
        <button 
          onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
          disabled={pageNumber <= 1}
        >
          上一页
        </button>
        <span>第 {pageNumber} 页 / 共 {numPages || '--'} 页</span>
        <button 
          onClick={() => setPageNumber(prev => Math.min(numPages || prev, prev + 1))}
          disabled={pageNumber >= numPages}
        >
          下一页
        </button>
      </div>

      <div className="pdf-container">
        {pdfFile ? (
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page 
              pageNumber={pageNumber}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        ) : (
          <div className="upload-hint">请选择PDF文件</div>
        )}
      </div>
    </div>
  );
};

export default SimplePDFViewer;