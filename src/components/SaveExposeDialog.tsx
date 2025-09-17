import React, { useState } from 'react';
import { ExposeFileManager } from '../services/exposeFileManager';

interface SaveExposeDialogProps {
  isOpen: boolean;
  currentExposeId: string | null;
  currentAddress: string;
  currentMerkmal: string;
  data: any;
  photos: string[];
  onSave: (id: string, fileName: string) => void;
  onCancel: () => void;
}

export const SaveExposeDialog: React.FC<SaveExposeDialogProps> = ({
  isOpen,
  currentExposeId,
  currentAddress,
  currentMerkmal,
  data,
  photos,
  onSave,
  onCancel
}) => {
  const [address, setAddress] = useState(currentAddress || data.adresse || '');
  const [merkmal, setMerkmal] = useState(currentMerkmal || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');

  React.useEffect(() => {
    if (address && merkmal) {
      const fileName = ExposeFileManager.generateFileName(address, merkmal);
      setPreviewFileName(fileName);
      
      // Prüfe ob Dateiname bereits existiert (außer für das aktuelle Exposé)
      const exists = ExposeFileManager.fileNameExists(fileName, currentExposeId || undefined);
      if (exists) {
        setErrorMessage('Ein Exposé mit diesem Namen existiert bereits.');
      } else {
        setErrorMessage('');
      }
    } else {
      setPreviewFileName('');
      setErrorMessage('');
    }
  }, [address, merkmal, currentExposeId]);

  const handleSave = () => {
    if (!address.trim()) {
      setErrorMessage('Bitte geben Sie eine Adresse ein.');
      return;
    }
    
    if (!merkmal.trim()) {
      setErrorMessage('Bitte geben Sie ein Merkmal ein.');
      return;
    }

    if (errorMessage) {
      return;
    }

    try {
      const savedId = ExposeFileManager.saveExpose(
        currentExposeId,
        address.trim(),
        merkmal.trim(),
        data,
        photos
      );
      onSave(savedId, previewFileName);
    } catch (error) {
      setErrorMessage('Fehler beim Speichern: ' + (error as Error).message);
    }
  };

  const handleAddressFromData = () => {
    if (data.adresse) {
      setAddress(data.adresse);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content save-dialog">
        <h3>{currentExposeId ? 'Exposé aktualisieren' : 'Exposé speichern'}</h3>
        
        <div className="form-group">
          <label htmlFor="save-address">Adresse:</label>
          <input
            id="save-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="z.B. Musterstraße 123, 12345 Musterstadt"
            className="save-input"
          />
          {data.adresse && data.adresse !== address && (
            <button 
              type="button" 
              className="btn-link"
              onClick={handleAddressFromData}
            >
              Adresse aus Exposé übernehmen: "{data.adresse}"
            </button>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="save-merkmal">Merkmal/Zusatz:</label>
          <input
            id="save-merkmal"
            type="text"
            value={merkmal}
            onChange={(e) => setMerkmal(e.target.value)}
            placeholder="z.B. Renoviert, Erstbezug, Version2, etc."
            className="save-input"
          />
        </div>

        {previewFileName && (
          <div className="filename-preview">
            <strong>Dateiname:</strong> {previewFileName}
          </div>
        )}

        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}

        <div className="modal-actions">
          <button 
            className="btn-secondary" 
            onClick={onCancel}
          >
            Abbrechen
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={!address.trim() || !merkmal.trim() || !!errorMessage}
          >
            {currentExposeId ? 'Aktualisieren' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
};