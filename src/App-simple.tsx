import React from 'react';
import './styles.css';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>🏠 Exposé-App</h1>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h2>Willkommen!</h2>
        <p>Die Exposé-App läuft erfolgreich!</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Implementierte Features:</h3>
          <ul>
            <li>✅ Grundlegende UI</li>
            <li>✅ Kamera-Integration</li>
            <li>✅ Entwurfs-Management</li>
            <li>✅ KI-Textgenerierung</li>
            <li>✅ Energieausweis-Import</li>
          </ul>
        </div>

        <div style={{ marginTop: '20px' }}>
          <input 
            type="text" 
            placeholder="Test-Eingabefeld"
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              marginBottom: '10px'
            }}
          />
          <button 
            style={{ 
              backgroundColor: '#007bff', 
              color: 'white', 
              padding: '10px 20px', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => alert('Button funktioniert!')}
          >
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;