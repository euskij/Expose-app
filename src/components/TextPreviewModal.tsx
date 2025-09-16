import { X } from 'lucide-react';

interface TextPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  texts: {
    title: string;
    shortDescription: string;
    longDescription: string;
    highlights: string[];
  };
  onApply: () => void;
}

export function TextPreviewModal({ isOpen, onClose, texts, onApply }: TextPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Generierte Texte</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="text-preview-section">
            <h4>Titel</h4>
            <p>{texts.title}</p>
          </div>
          
          <div className="text-preview-section">
            <h4>Kurzbeschreibung</h4>
            <p>{texts.shortDescription}</p>
          </div>
          
          <div className="text-preview-section">
            <h4>Ausführliche Beschreibung</h4>
            <p>{texts.longDescription}</p>
          </div>
          
          <div className="text-preview-section">
            <h4>Highlights</h4>
            <ul>
              {texts.highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="ui-btn secondary" onClick={onClose}>Abbrechen</button>
          <button className="ui-btn primary" onClick={onApply}>Übernehmen</button>
        </div>
      </div>
    </div>
  );
}