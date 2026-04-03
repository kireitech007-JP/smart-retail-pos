import React from "react";

// Debug version untuk troubleshooting blank putih
function AppDebug() {
  console.log('AppDebug component rendered');
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>Smart Retail POS - Debug Mode</h1>
      <p style={{ color: '#666' }}>Aplikasi berhasil render!</p>
      <div style={{ 
        backgroundColor: '#fff', 
        padding: '15px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>Debug Information:</h2>
        <ul>
          <li>✅ React: Working</li>
          <li>✅ Rendering: Working</li>
          <li>✅ CSS: Working</li>
          <li>✅ JavaScript: Working</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => alert('Button clicked!')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Button
        </button>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Browser Console Check:</h3>
        <p>1. Buka Developer Tools (F12)</p>
        <p>2. Lihat tab Console</p>
        <p>3. Seharusnya ada log: "AppDebug component rendered"</p>
      </div>
    </div>
  );
}

export default AppDebug;
