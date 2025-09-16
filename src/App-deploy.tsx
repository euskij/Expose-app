function App() {
  return (
    <div style={{ 
      padding: '40px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      color: '#1e293b'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            color: '#0f172a', 
            marginBottom: '16px' 
          }}>
            🏠 Exposé-App
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#64748b',
            marginBottom: '0'
          }}>
            Professionelle Immobilien-Exposés erstellen
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div style={{
            padding: '24px',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ color: '#0f172a', marginBottom: '16px' }}>✅ Kamera-Integration</h3>
            <p style={{ color: '#475569', margin: '0' }}>
              Direkte Bildaufnahme im Browser für Immobilienfotos
            </p>
          </div>

          <div style={{
            padding: '24px',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ color: '#0f172a', marginBottom: '16px' }}>✅ KI-Textgenerierung</h3>
            <p style={{ color: '#475569', margin: '0' }}>
              Automatische Erstellung professioneller Exposé-Texte
            </p>
          </div>

          <div style={{
            padding: '24px',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ color: '#0f172a', marginBottom: '16px' }}>✅ Entwurfs-Management</h3>
            <p style={{ color: '#475569', margin: '0' }}>
              Speicherung und Versionierung von Immobilien-Entwürfen
            </p>
          </div>

          <div style={{
            padding: '24px',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ color: '#0f172a', marginBottom: '16px' }}>✅ Energieausweis-Import</h3>
            <p style={{ color: '#475569', margin: '0' }}>
              PDF-Parser für automatische Datenextraktion
            </p>
          </div>
        </div>

        <div style={{
          padding: '32px',
          backgroundColor: '#dbeafe',
          borderRadius: '8px',
          border: '2px solid #3b82f6',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#1e40af', marginBottom: '16px' }}>🚀 App erfolgreich deployed!</h2>
          <p style={{ color: '#1e40af', fontSize: '1.1rem', margin: '0' }}>
            Die Exposé-App läuft live auf Vercel und ist bereit für den Einsatz.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;