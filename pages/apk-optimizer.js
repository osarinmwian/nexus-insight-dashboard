import { useState } from 'react';
import { useRouter } from 'next/router';

export default function APKOptimizer() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const router = useRouter();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setProgress(0);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const response = await fetch('/api/optimize-apk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Filename': file.name
        },
        body: arrayBuffer
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📱 APK Optimizer</h1>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Upload APK for Optimization</h2>
        
        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="file"
              accept=".apk"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ 
                padding: '10px', 
                border: '2px dashed #ccc', 
                borderRadius: '4px',
                width: '100%'
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={!file || uploading}
            style={{
              backgroundColor: uploading ? '#ccc' : '#007bff',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: uploading ? 'not-allowed' : 'pointer'
            }}
          >
            {uploading ? '🔄 Optimizing...' : '🚀 Optimize APK'}
          </button>
        </form>
        
        {uploading && (
          <div style={{ marginTop: '15px' }}>
            <div style={{ backgroundColor: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  backgroundColor: '#007bff', 
                  height: '20px', 
                  width: `${progress}%`,
                  transition: 'width 0.3s'
                }}
              />
            </div>
            <p>Processing: {progress}%</p>
          </div>
        )}
      </div>
      
      {result && (
        <div style={{ 
          backgroundColor: result.error ? '#f8d7da' : '#d4edda', 
          padding: '20px', 
          borderRadius: '8px',
          border: `1px solid ${result.error ? '#dc3545' : '#28a745'}`
        }}>
          {result.error ? (
            <div>
              <h3>❌ Optimization Failed</h3>
              <p>{result.error}</p>
            </div>
          ) : (
            <div>
              <h3>✅ APK Optimized Successfully</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
                <div>
                  <h4>📊 Size Reduction</h4>
                  <p>Original: {result.originalSize}</p>
                  <p>Optimized: {result.optimizedSize}</p>
                  <p style={{ color: '#28a745', fontWeight: 'bold' }}>
                    Saved: {result.sizeSaved} ({result.percentSaved}%)
                  </p>
                </div>
                <div>
                  <h4>🔧 Optimizations Applied</h4>
                  <ul>
                    <li>✅ Resource compression</li>
                    <li>✅ APK alignment</li>
                    <li>✅ Digital signing</li>
                    <li>✅ Verification</li>
                  </ul>
                </div>
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <a 
                  href={result.downloadUrl}
                  download
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '10px 20px',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    marginRight: '10px'
                  }}
                >
                  📥 Download Optimized APK
                </a>
                
                {result.bundleUrl && (
                  <a 
                    href={result.bundleUrl}
                    download
                    style={{
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      padding: '10px 20px',
                      textDecoration: 'none',
                      borderRadius: '4px'
                    }}
                  >
                    📦 Download AAB Bundle
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>💡 What This Does</h3>
        <ul>
          <li><strong>Compression:</strong> Optimizes resources and assets</li>
          <li><strong>Alignment:</strong> Aligns APK for faster loading</li>
          <li><strong>Signing:</strong> Signs APK for distribution</li>
          <li><strong>Bundle Generation:</strong> Creates AAB for Play Store</li>
          <li><strong>Size Reduction:</strong> Typically 20-40% smaller</li>
        </ul>
      </div>
    </div>
  );
}