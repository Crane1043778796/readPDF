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
  const [scale, setScale] = useState(1.0);
  const [selectedText, setSelectedText] = useState('');
  const [annotations, setAnnotations] = useState([]);

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

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text.length > 0) {
      setSelectedText(text);
    }
  };

  // 添加高亮样式状态
  const [highlights, setHighlights] = useState([]);

  const handleAddAnnotation = () => {
    if (selectedText) {
      try {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const textLayer = document.querySelector('.react-pdf__Page__textContent');
        
        if (!textLayer) {
          console.error('文本层未找到');
          return;
        }
    
        const textLayerRect = textLayer.getBoundingClientRect();
        const rects = Array.from(range.getClientRects());
        
        if (rects.length === 0) {
          console.error('无法获取选中文本的位置信息');
          return;
        }
    
        const positions = rects.map(rect => ({
          top: (rect.top - textLayerRect.top) / scale,
          left: (rect.left - textLayerRect.left) / scale,
          width: rect.width / scale,
          height: rect.height / scale
        }));
    
        const newAnnotation = {
          text: selectedText,
          page: pageNumber,
          timestamp: new Date().toISOString(),
          positions: positions
        };
    
        setAnnotations(prev => [...prev, newAnnotation]);
        setHighlights(prev => [...prev, {
          page: pageNumber,
          positions: positions
        }]);
        setSelectedText('');
      } catch (error) {
        console.error('创建标注时出错:', error);
      }
    }
  };

  // 修改渲染高亮的部分
  {highlights.filter(h => h.page === pageNumber).map((highlight, index) => (
    <React.Fragment key={index}>
      {highlight.positions?.map((pos, posIndex) => (
        pos && pos.top !== undefined && (
          <div
            key={`${index}-${posIndex}`}
            className="highlight-overlay"
            style={{
              position: 'absolute',
              top: `${pos.top * scale}px`,
              left: `${pos.left * scale}px`,
              width: `${pos.width * scale}px`,
              height: `${pos.height * scale}px`,
              backgroundColor: 'rgba(255, 255, 0, 0.3)',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        )
      ))}
    </React.Fragment>
  ))}

  const handleAnnotationClick = (page) => {
    setPageNumber(page);
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
        <button onClick={() => setScale(s => s + 0.1)}>放大</button>
        <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>缩小</button>
        {selectedText && (
          <button onClick={handleAddAnnotation}>添加标注</button>
        )}
      </div>

      <div className="content-container">
        <div className="pdf-container" onMouseUp={handleTextSelection}>
          {pdfFile ? (
            <Document
              file={pdfFile}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              <div className="page-container">
                <Page 
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
                {highlights.filter(h => h.page === pageNumber).map((highlight, index) => (
                  <React.Fragment key={index}>
                    {highlight.positions?.map((pos, posIndex) => (
                      pos && pos.top !== undefined && (
                        <div
                          key={`${index}-${posIndex}`}
                          className="highlight-overlay"
                          style={{
                            position: 'absolute',
                            top: `${pos.top * scale}px`,
                            left: `${pos.left * scale}px`,
                            width: `${pos.width * scale}px`,
                            height: `${pos.height * scale}px`,
                            backgroundColor: 'rgba(255, 255, 0, 0.3)',
                            pointerEvents: 'none',
                            zIndex: 1
                          }}
                        />
                      )
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </Document>
          ) : (
            <div className="upload-hint">请选择PDF文件</div>
          )}
        </div>

        <div className="annotations-panel">
          <h3>标注列表</h3>
          {annotations.map((anno, index) => (
            <div 
              key={index} 
              className="annotation-item"
              onClick={() => handleAnnotationClick(anno.page)}
            >
              <p>{anno.text}</p>
              <span>页码: {anno.page}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimplePDFViewer;