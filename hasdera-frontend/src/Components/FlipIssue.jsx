import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";
import { getIssueById } from "../Services/issuesService";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// הגדרת worker ל־PDF.js

const FlipIssue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfPages, setPdfPages] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState("");
  const flipBookRef = useRef(null);

  useEffect(() => {
    loadIssue();
  }, [id]);

  const loadIssue = async () => {
    try {
      setLoading(true);
      console.log("🔄 טוען נתוני גיליון...");
      const issueData = await getIssueById(id);
      console.log("✅ נתוני גיליון נטענו:", issueData);
      setIssue(issueData);
      
      if (issueData.pdfUrl) {
        console.log("🔄 מתחיל טעינת PDF...");
        await loadPdf(issueData.pdfUrl);
      } else {
        console.log("❌ אין PDF URL");
        setError("PDF לא זמין");
      }
    } catch (err) {
      console.error("❌ שגיאה בטעינת הגיליון:", err);
      setError("שגיאה בטעינת הגיליון");
    } finally {
      setLoading(false);
    }
  };

  const testPdfDownload = async () => {
    try {
      setDownloadStatus("🔄 בודק הורדת PDF...");
      const backendUrl = `https://localhost:7083/api/issues/${id}/pdf`;
      console.log("🔄 בודק הורדת PDF:", backendUrl);
      
      const response = await fetch(backendUrl);
      console.log("📥 תגובת שרת:", response.status, response.statusText);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log("📥 PDF נטען בהצלחה! גודל:", blob.size, "bytes");
        
        // יצירת קישור הורדה
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${issue?.title || 'gilyon'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setDownloadStatus("✅ PDF הורד בהצלחה!");
      } else {
        setDownloadStatus(`❌ שגיאה: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error("❌ שגיאה בהורדת PDF:", err);
      setDownloadStatus(`❌ שגיאה: ${err.message}`);
    }
  };

  const loadPdf = async (pdfUrl) => {
    try {
      console.log("🔄 מתחיל טעינת PDF...");
      console.log("PDF URL:", pdfUrl);
  
      // Fetch הקובץ כ־ArrayBuffer
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
  
      // טוענים את ה־PDF מתוך ה־ArrayBuffer
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
  
      console.log(`✅ PDF נטען בהצלחה! ${pdf.numPages} עמודים`);
  
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`🔄 טוען עמוד ${i}/${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
  
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
  
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
  
        pages.push({
          pageNumber: i,
          canvas: canvas,
          width: viewport.width,
          height: viewport.height,
        });
      }
  
      console.log(`✅ כל העמודים נטענו! ${pages.length} עמודים`);
      setPdfPages(pages);
    } catch (err) {
      console.error("❌ שגיאה בטעינת PDF:", err);
      setError("שגיאה בטעינת ה-PDF");
    }
  };
  

  const openPdfInNewTab = () => {
    if (issue?.pdfUrl) {
      window.open(issue.pdfUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">טוען גיליון...</div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-xl text-red-600 mb-4">
          {error || "גיליון לא נמצא"}
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          חזרה לרשימה
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* כותרת */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{issue.title}</h1>
        <div className="flex gap-2">
          <button
            onClick={testPdfDownload}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            בדוק הורדת PDF
          </button>
          <button
            onClick={openPdfInNewTab}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            פתח כ-PDF
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            חזרה לרשימה
          </button>
        </div>
      </div>

      {/* סטטוס הורדה */}
      {downloadStatus && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4">
          <p className="font-bold">{downloadStatus}</p>
        </div>
      )}

      {/* ספר PDF */}
      <div className="flex-1 flex justify-center items-center p-4">
        {pdfPages.length > 0 ? (
          <div className="shadow-2xl">
            <HTMLFlipBook
              ref={flipBookRef}
              width={400}
              height={600}
              size="stretch"
              minWidth={300}
              maxWidth={600}
              minHeight={400}
              maxHeight={800}
              maxShadowOpacity={0.5}
              showCover={true}
              mobileScrollSupport={true}
              className="demo-book"
              style={{}}
              startPage={0}
              drawShadow={true}
              flippingTime={1000}
              usePortrait={true}
              startLeft={false}
              swipeDistance={30}
              clickEventForward={true}
              disableFlipByClick={false}
              useMouseEvents={true}
              showPageCorners={true}
            >
              {pdfPages.map((page, index) => (
                <div key={index} className="page">
                  <div className="page-content">
                    <img
                      src={page.canvas.toDataURL()}
                      alt={`עמוד ${page.pageNumber}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </div>
              ))}
            </HTMLFlipBook>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-xl text-gray-600 mb-4">טוען עמודים...</div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlipIssue;
