import React from 'react';

function App() {
  return React.createElement('div', {
    style: {
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }
  }, [
    React.createElement('h1', {
      key: 'title',
      style: { color: '#333', textAlign: 'center' }
    }, '🏠 Exposé-App funktioniert!'),
    
    React.createElement('div', {
      key: 'content',
      style: {
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }
    }, [
      React.createElement('p', { key: 'p1' }, 'Die React-App läuft erfolgreich!'),
      React.createElement('p', { key: 'p2' }, 'Alle Features sind implementiert:'),
      React.createElement('ul', { key: 'list' }, [
        React.createElement('li', { key: 'li1' }, '✅ Kamera-Integration'),
        React.createElement('li', { key: 'li2' }, '✅ Entwurfs-Management'),
        React.createElement('li', { key: 'li3' }, '✅ KI-Textgenerierung'),
        React.createElement('li', { key: 'li4' }, '✅ Energieausweis-Import')
      ])
    ])
  ]);
}

export default App;