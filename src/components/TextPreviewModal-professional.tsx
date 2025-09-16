import React from 'react';

interface TextPreviewModalProps {
  data: any;
  photos: string[];
  isOpen: boolean;
  onClose: () => void;
}

export const TextPreviewModal: React.FC<TextPreviewModalProps> = ({ 
  data, 
  photos, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  const formatPrice = (price: string) => {
    if (!price) return '--';
    return parseInt(price).toLocaleString() + '€';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📄 Exposé-Vorschau</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="expose-preview">
            {/* Header */}
            <div className="expose-header">
              <h1 className="expose-title">{data.titel || 'Immobilien-Exposé'}</h1>
              <div className="expose-meta">
                <span className="object-type">{data.objektTyp}</span>
                <span className="location">{data.lage}</span>
              </div>
            </div>

            {/* Photos */}
            {photos.length > 0 && (
              <div className="expose-photos">
                <div className="main-photo">
                  <img src={photos[0]} alt="Hauptfoto" />
                </div>
                {photos.slice(1, 5).length > 0 && (
                  <div className="thumbnail-photos">
                    {photos.slice(1, 5).map((photo, index) => (
                      <img key={index} src={photo} alt={`Foto ${index + 2}`} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Key Facts */}
            <div className="key-facts">
              <h3>📊 Eckdaten</h3>
              <div className="facts-grid">
                <div className="fact-item">
                  <span className="fact-label">Wohnfläche:</span>
                  <span className="fact-value">{data.wohnflaeche ? `${data.wohnflaeche}m²` : '--'}</span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Zimmer:</span>
                  <span className="fact-value">{data.zimmer || '--'}</span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Baujahr:</span>
                  <span className="fact-value">{data.baujahr || '--'}</span>
                </div>
                <div className="fact-item">
                  <span className="fact-label">Verkaufspreis:</span>
                  <span className="fact-value">{formatPrice(data.verkaufspreis)}</span>
                </div>
                {data.ist_miete && (
                  <div className="fact-item">
                    <span className="fact-label">Miete:</span>
                    <span className="fact-value">{formatPrice(data.ist_miete)}/Monat</span>
                  </div>
                )}
                {data.nebenkosten && (
                  <div className="fact-item">
                    <span className="fact-label">Nebenkosten:</span>
                    <span className="fact-value">{formatPrice(data.nebenkosten)}/Monat</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {data.kurzbeschreibung && (
              <div className="expose-section">
                <h3>📝 Beschreibung</h3>
                <p>{data.kurzbeschreibung}</p>
              </div>
            )}

            {data.langbeschreibung && (
              <div className="expose-section">
                <h3>🏠 Objektbeschreibung</h3>
                <p>{data.langbeschreibung}</p>
              </div>
            )}

            {/* Equipment */}
            {data.ausstattung && (
              <div className="expose-section">
                <h3>⚙️ Ausstattung</h3>
                <div className="equipment-text">
                  {data.ausstattung.split('\n').map((line: string, index: number) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {(data.adresse || data.lage_beschreibung) && (
              <div className="expose-section">
                <h3>📍 Lage</h3>
                {data.adresse && <p><strong>Adresse:</strong> {data.adresse}</p>}
                {data.lage_beschreibung && <p>{data.lage_beschreibung}</p>}
              </div>
            )}

            {/* Technical Details */}
            <div className="expose-section">
              <h3>🔧 Technische Daten</h3>
              <div className="technical-grid">
                {data.grundstuecksflaeche && (
                  <div className="tech-item">
                    <span>Grundstücksfläche:</span>
                    <span>{data.grundstuecksflaeche}m²</span>
                  </div>
                )}
                {data.heizungsart && (
                  <div className="tech-item">
                    <span>Heizung:</span>
                    <span>{data.heizungsart}</span>
                  </div>
                )}
                {data.bauzustand && (
                  <div className="tech-item">
                    <span>Bauzustand:</span>
                    <span>{data.bauzustand}</span>
                  </div>
                )}
                {data.balkone && (
                  <div className="tech-item">
                    <span>Balkone:</span>
                    <span>{data.balkone}</span>
                  </div>
                )}
                {data.garage === 'ja' && (
                  <div className="tech-item">
                    <span>Garage:</span>
                    <span>Vorhanden</span>
                  </div>
                )}
                {data.keller === 'ja' && (
                  <div className="tech-item">
                    <span>Keller:</span>
                    <span>Vorhanden</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Details */}
            {(data.verkaufspreis || data.ist_miete) && (
              <div className="expose-section">
                <h3>💰 Finanzierung</h3>
                <div className="financial-grid">
                  {data.verkaufspreis && (
                    <div className="financial-item">
                      <span>Verkaufspreis:</span>
                      <span className="price">{formatPrice(data.verkaufspreis)}</span>
                    </div>
                  )}
                  {data.ist_miete && (
                    <div className="financial-item">
                      <span>Kaltmiete:</span>
                      <span>{formatPrice(data.ist_miete)}/Monat</span>
                    </div>
                  )}
                  {data.nebenkosten && (
                    <div className="financial-item">
                      <span>Nebenkosten:</span>
                      <span>{formatPrice(data.nebenkosten)}/Monat</span>
                    </div>
                  )}
                  {data.maklercourtage && (
                    <div className="financial-item">
                      <span>Maklercourtage:</span>
                      <span>{data.maklercourtage}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="expose-footer">
              <p className="disclaimer">
                Alle Angaben ohne Gewähr. Änderungen und Irrtümer vorbehalten.
                Erstellt mit der Exposé-App am {new Date().toLocaleDateString('de-DE')}.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Schließen
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            📄 PDF erstellen
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 2px solid #e2e8f0;
        }

        .modal-header h2 {
          margin: 0;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: #f7fafc;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 24px;
          border-top: 2px solid #e2e8f0;
        }

        .expose-preview {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
        }

        .expose-header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 3px solid #667eea;
        }

        .expose-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 12px 0;
        }

        .expose-meta {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .object-type,
        .location {
          background: #667eea;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .expose-photos {
          margin-bottom: 32px;
        }

        .main-photo {
          margin-bottom: 12px;
        }

        .main-photo img {
          width: 100%;
          height: 400px;
          object-fit: cover;
          border-radius: 12px;
        }

        .thumbnail-photos {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
        }

        .thumbnail-photos img {
          width: 100%;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
        }

        .key-facts {
          background: #f7fafc;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
        }

        .key-facts h3 {
          margin: 0 0 16px 0;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .facts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .fact-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          background: white;
          border-radius: 8px;
          border: 2px solid #e2e8f0;
        }

        .fact-label {
          font-weight: 600;
          color: #4a5568;
        }

        .fact-value {
          font-weight: 700;
          color: #2d3748;
        }

        .expose-section {
          margin-bottom: 32px;
        }

        .expose-section h3 {
          color: #2d3748;
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 8px;
        }

        .expose-section p {
          color: #4a5568;
          margin: 0 0 12px 0;
        }

        .equipment-text p {
          margin-bottom: 8px;
        }

        .technical-grid,
        .financial-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;
        }

        .tech-item,
        .financial-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f7fafc;
          border-radius: 6px;
          border-left: 4px solid #667eea;
        }

        .financial-item .price {
          font-weight: 700;
          color: #2b6cb0;
          font-size: 1.1rem;
        }

        .expose-footer {
          text-align: center;
          padding-top: 24px;
          border-top: 2px solid #e2e8f0;
          margin-top: 32px;
        }

        .disclaimer {
          color: #718096;
          font-size: 0.9rem;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .modal-content {
            margin: 10px;
            max-height: 95vh;
          }

          .expose-meta {
            flex-direction: column;
            align-items: center;
          }

          .facts-grid,
          .technical-grid,
          .financial-grid {
            grid-template-columns: 1fr;
          }

          .main-photo img {
            height: 250px;
          }
        }

        @media print {
          .modal-overlay {
            position: static;
            background: none;
            padding: 0;
          }

          .modal-content {
            max-width: none;
            max-height: none;
            box-shadow: none;
          }

          .modal-header,
          .modal-footer {
            display: none;
          }

          .modal-body {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};