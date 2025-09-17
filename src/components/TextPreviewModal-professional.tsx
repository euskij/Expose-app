import React from 'react';
import ExposePreview from './ExposePreview';

interface TextPreviewModalProps {
  data: any;
  photos: string[];
  logo?: string | null;
  isOpen: boolean;
  onClose: () => void;
  theme?: 'blue' | 'neutral';
  includeOriginalImages?: boolean;
  showAgentNotices?: boolean;
}

export const TextPreviewModal: React.FC<TextPreviewModalProps> = ({
  data,
  photos,
  logo,
  isOpen,
  onClose,
  theme = 'blue',
  includeOriginalImages = true,
  showAgentNotices = true
}) => {
  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    try {
      const [{ pdf }, { saveAs }, { ExposePDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('file-saver'),
        import('./ExposePDF')
      ]);
      const blob = await pdf(
        <ExposePDF
          data={data}
          photos={photos}
          logo={logo || undefined}
          theme={theme}
          includeOriginalImages={includeOriginalImages}
          showAgentNotices={showAgentNotices}
        />
      ).toBlob();
      const filename = `Expose_${data.adresse || 'Immobilie'}.pdf`;
      saveAs(blob, filename);
    } catch (err) {
      console.error('PDF-Generation fehlgeschlagen', err);
      alert('PDF konnte nicht erstellt werden.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content expose-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📄 Exposé-Vorschau</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <ExposePreview
            data={data}
            photos={photos}
            logo={logo || null}
            theme={theme}
            includeOriginalImages={includeOriginalImages}
            showAgentNotices={showAgentNotices}
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleDownloadPDF}>📄 PDF erzeugen & herunterladen</button>
          <button className="btn btn-secondary" onClick={onClose}>Schließen</button>
        </div>
      </div>
    </div>
  );
};