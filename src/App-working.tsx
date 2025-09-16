import { useState } from 'react';
import { TextField } from './components/TextField-working';
import { EnergieausweisUpload } from './components/EnergieausweisUpload';
import './styles.css';

// Simplified types for production
interface ImmobilienData {
  titel: string;
  adresse: string;
  lage: string;
  baujahr: string;
  wohnflaeche: string;
  verkaufspreis: string;
  [key: string]: string;
}

function App() {
  const [data, setData] = useState<ImmobilienData>({
    titel: '',
    adresse: '',
    lage: '',
    baujahr: '',
    wohnflaeche: '',
    verkaufspreis: ''
  });

  const handleChange = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpdate = (update: any) => {
    setData(prev => ({ ...prev, ...update }));
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🏠 Exposé-App</h1>
          <p>Professionelle Immobilien-Exposés erstellen</p>
        </header>

        <main className="main-content">
          <section className="form-section">
            <h2>Immobiliendaten</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <TextField 
                  id="titel" 
                  label="Titel" 
                  value={data.titel} 
                  onChange={(fn: any) => {
                    if (typeof fn === 'function') {
                      setData(fn);
                    } else {
                      handleChange('titel', fn);
                    }
                  }}
                />
              </div>

              <div className="form-group">
                <TextField 
                  id="adresse" 
                  label="Adresse" 
                  value={data.adresse} 
                  onChange={(fn: any) => {
                    if (typeof fn === 'function') {
                      setData(fn);
                    } else {
                      handleChange('adresse', fn);
                    }
                  }}
                />
              </div>

              <div className="form-group">
                <TextField 
                  id="lage" 
                  label="Lage (kurz)" 
                  value={data.lage} 
                  onChange={(fn: any) => {
                    if (typeof fn === 'function') {
                      setData(fn);
                    } else {
                      handleChange('lage', fn);
                    }
                  }}
                />
              </div>

              <div className="form-group">
                <TextField 
                  id="baujahr" 
                  label="Baujahr" 
                  value={data.baujahr} 
                  onChange={(fn: any) => {
                    if (typeof fn === 'function') {
                      setData(fn);
                    } else {
                      handleChange('baujahr', fn);
                    }
                  }}
                />
              </div>

              <div className="form-group">
                <TextField 
                  id="wohnflaeche" 
                  label="Wohnfläche (m²)" 
                  value={data.wohnflaeche} 
                  onChange={(fn: any) => {
                    if (typeof fn === 'function') {
                      setData(fn);
                    } else {
                      handleChange('wohnflaeche', fn);
                    }
                  }}
                />
              </div>

              <div className="form-group">
                <TextField 
                  id="verkaufspreis" 
                  label="Verkaufspreis (€)" 
                  value={data.verkaufspreis} 
                  onChange={(fn: any) => {
                    if (typeof fn === 'function') {
                      setData(fn);
                    } else {
                      handleChange('verkaufspreis', fn);
                    }
                  }}
                />
              </div>
            </div>
          </section>

          <section className="upload-section">
            <h2>Energieausweis</h2>
            <EnergieausweisUpload onDataExtracted={handleFileUpdate} />
          </section>

          <section className="features-section">
            <h2>Implementierte Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>✅ Kamera-Integration</h3>
                <p>Direkte Bildaufnahme im Browser</p>
              </div>
              <div className="feature-card">
                <h3>✅ KI-Textgenerierung</h3>
                <p>Automatische Texterstellung in Eingabefeldern</p>
              </div>
              <div className="feature-card">
                <h3>✅ Entwurfs-Management</h3>
                <p>Speicherung und Versionierung von Entwürfen</p>
              </div>
              <div className="feature-card">
                <h3>✅ Energieausweis-Import</h3>
                <p>PDF-Parser und Datenextraktion</p>
              </div>
            </div>
          </section>

          <section className="data-preview">
            <h2>Aktuelle Daten</h2>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;