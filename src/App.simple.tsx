import React from 'react';

function AppSimple() {
  return React.createElement('div', {
    style: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }
  }, [
    React.createElement('h1', { 
      key: 'title',
      style: { color: '#333', marginBottom: '20px' }
    }, 'Smart Retail POS - Simple Version'),
    
    React.createElement('div', {
      key: 'content',
      style: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    }, [
      React.createElement('h2', { key: 'subtitle', style: { color: '#666' } }, '✅ Aplikasi Berhasil Render!'),
      React.createElement('p', { key: 'desc', style: { color: '#888' } }, 'Ini adalah versi sederhana untuk debugging.'),
      
      React.createElement('button', {
        key: 'button',
        onClick: () => alert('Button berfungsi!'),
        style: {
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '15px'
        }
      }, 'Test Interactivity')
    ])
  ]);
}

export default AppSimple;
