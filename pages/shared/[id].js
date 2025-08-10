import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function SharedAPK() {
  const router = useRouter();
  const { id } = router.query;
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchShareData();
    }
  }, [id]);

  const fetchShareData = async () => {
    try {
      const response = await fetch(`/api/shared/${id}`);
      if (response.ok) {
        const data = await response.json();
        setShareData(data);
      } else {
        setError('Shared APK not found or expired');
      }
    } catch (err) {
      setError('Failed to load shared APK');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>📱 Shared Optimized APK</h1>
      
      <div style={{ backgroundColor: '#d4edda', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>✅ APK Successfully Optimized</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <strong>Original Size:</strong> {shareData.originalSize}
          </div>
          <div>
            <strong>Optimized Size:</strong> {shareData.optimizedSize}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <strong style={{ color: '#28a745' }}>Size Reduction: {shareData.percentSaved}%</strong>
          </div>
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <a 
          href={shareData.downloadUrl}
          download
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '15px 30px',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            display: 'inline-block'
          }}
        >
          📥 Download Optimized APK
        </a>
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3>🔧 Optimizations Applied</h3>
        <ul>
          <li>✅ Resource compression</li>
          <li>✅ APK alignment for faster loading</li>
          <li>✅ Digital signing for security</li>
          <li>✅ Size optimization</li>
        </ul>
        
        <p style={{ fontSize: '12px', color: '#666', marginTop: '20px' }}>
          Shared on: {new Date(shareData.createdAt).toLocaleString()}<br/>
          Expires: {new Date(shareData.expiresAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}