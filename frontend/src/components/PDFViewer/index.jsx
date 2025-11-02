import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import './styles.css';

// 修改 worker 配置
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

const PDFViewer = () => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const containerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    setError(error);
    setLoading(false);
    console.error('PDF加载错误:', error);
  };

  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollTop);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      setSelectedText(selection.toString());
    }
  };

  const saveHighlight = async () => {
    try {
      const result = await axios.post('/api/save-highlight/', {
        text: selectedText,
        page_number: pageNumber,
        pdf_file: pdfFile,
        type: highlightType
      });
      console.log('Highlight saved:', result.data);
    } catch (error) {
      console.error('Failed to save highlight:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const result = await axios.post('/api/save-progress/', {
        page_number: pageNumber,
        scroll_position: scrollPosition,
        pdf_file: 'current.pdf'
      });
      console.log('保存成功:', result.data);
    } catch (error) {
      console.error('保存进度失败:', error);
    }
  };

  // 添加文件上传功能
  const [pdfFile, setPdfFile] = useState(null);

  // 添加缺失的状态变量
  const [selectedText, setSelectedText] = useState('');
  const [highlightType, setHighlightType] = useState('1');
  const [highlights, setHighlights] = useState([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      // 先清理之前的 URL
      if (pdfFile) {
        URL.revokeObjectURL(pdfFile);
      }
      const fileUrl = URL.createObjectURL(file);
      setPdfFile(fileUrl);
      setLoading(true);
      setError(null);
    }
  };
  
  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (pdfFile) {
        URL.revokeObjectURL(pdfFile);
      }
    };
  }, [pdfFile]);
  
  // 修改 Document 组件的配置
  return (
    <div className="pdf-viewer-container">
      <div className="toolbar">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
        />
        <button onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}>
          上一页
        </button>
        <span>
          第 {pageNumber} 页，共 {numPages} 页
        </span>
        <button onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}>
          下一页
        </button>
        <button onClick={() => setScale(scale + 0.1)}>放大</button>
        <button onClick={() => setScale(Math.max(0.5, scale - 0.1))}>缩小</button>
        <button onClick={saveProgress}>保存进度</button>
        <select 
          value={highlightType} 
          onChange={(e) => setHighlightType(e.target.value)}
        >
          <option value="1">标注1</option>
          <option value="2">标注2</option>
          <option value="3">标注3</option>
        </select>
        <button 
          onClick={saveHighlight}
          disabled={!selectedText}
        >
          高亮标注
        </button>
      </div>
      
      <div 
        className="pdf-container" 
        ref={containerRef} 
        onScroll={handleScroll}
        onMouseUp={handleTextSelection}
      >
        {loading && <div>加载中...</div>}
        {error && <div>加载失败: {error.message}</div>}
        
        {pdfFile && (
          <Document
            file={pdfFile}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading="正在加载PDF..."
            options={{
              httpHeaders: {
                'Content-Type': 'application/pdf',
              },
              withCredentials: false,
            }}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              loading="正在加载页面..."
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        )}
        {!pdfFile && (
          <div className="upload-hint">
            请选择一个PDF文件
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;