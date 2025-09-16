import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Eye } from 'lucide-react';
import type { EnergieausweisData } from '../services/energieausweisParser';
import { parseEnergieausweis } from '../services/energieausweisParser';
import { Document, Page } from 'react-pdf';

interface Props {
  onDataExtracted: (data: EnergieausweisData) => void;
}

export function EnergieausweisUpload({ onDataExtracted }: Props) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      setError('Bitte laden Sie eine PDF-Datei hoch');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // PDF für Vorschau vorbereiten
      const url = URL.createObjectURL(file);
      setPdfUrl(url);

      // Daten extrahieren
      const data = await parseEnergieausweis(file);
      onDataExtracted(data);
    } catch (err) {
      setError('Fehler beim Verarbeiten des Energieausweises');
      console.error('Energieausweis Parse Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onDataExtracted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const togglePreview = () => {
    setShowPreview(prev => !prev);
  };

  return (
    <div className="energieausweis-upload">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        {isLoading ? (
          <div className="loading">
            Verarbeite Energieausweis...
          </div>
        ) : (
          <div className="upload-content">
            {isDragActive ? (
              <p>Energieausweis hier ablegen...</p>
            ) : (
              <p>Energieausweis hier ablegen oder klicken zum Auswählen</p>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {pdfUrl && !error && (
        <div className="preview-section">
          <button onClick={togglePreview} className="preview-toggle">
            <Eye size={16} />
            {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
          </button>

          {showPreview && (
            <div className="pdf-preview">
              <Document
                file={pdfUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<div>Lade PDF...</div>}
                error={<div>Fehler beim Laden der Vorschau</div>}
              >
                {Array.from(new Array(Math.min(numPages || 0, 2)), (_, index) => (
                  <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    width={300}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                ))}
              </Document>
            </div>
          )}
        </div>
      )}
    </div>
  );
}