import React, { useState, useEffect } from 'react';
import { ExposeFileManager } from '../services/exposeFileManager';
import type { ExposeListItem } from '../services/exposeFileManager';

interface ExposeStartScreenProps {
  onCreateNew: () => void;
  onLoadExisting: (exposeId: string) => void;
  onCopyExisting: (exposeId: string, newMerkmal: string) => void;
}

export const ExposeStartScreen: React.FC<ExposeStartScreenProps> = ({
  onCreateNew,
  onLoadExisting,
  onCopyExisting
}) => {
  const [exposeList, setExposeList] = useState<ExposeListItem[]>([]);
  const [selectedAction, setSelectedAction] = useState<'new' | 'edit' | 'copy' | null>(null);
  const [selectedExposeId, setSelectedExposeId] = useState<string>('');
  const [copyMerkmal, setCopyMerkmal] = useState<string>('');
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    loadExposeList();
  }, []);

  const loadExposeList = () => {
    const list = ExposeFileManager.loadExposeList();
    setExposeList(list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
  };

  const handleCreateNew = () => {
    onCreateNew();
  };

  const handleEditExisting = () => {
    if (selectedExposeId) {
      onLoadExisting(selectedExposeId);
    }
  };

  const handleCopyExisting = () => {
    if (selectedExposeId && copyMerkmal.trim()) {
      const newId = ExposeFileManager.copyExpose(selectedExposeId, copyMerkmal.trim());
      if (newId) {
        onCopyExisting(newId, copyMerkmal.trim());
      }
    }
  };

  const handleDeleteExpose = (id: string) => {
    ExposeFileManager.deleteExpose(id);
    loadExposeList();
    setShowConfirmDelete(null);
    if (selectedExposeId === id) {
      setSelectedExposeId('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="expose-start-screen">
      <div className="container">
        <h1>Exposé-Verwaltung</h1>
        <p className="subtitle">Was möchten Sie tun?</p>

        <div className="action-cards">
          {/* Neues Exposé erstellen */}
          <div 
            className={`action-card ${selectedAction === 'new' ? 'selected' : ''}`}
            onClick={() => setSelectedAction('new')}
          >
            <div className="action-icon">📄</div>
            <h3>Neues Exposé erstellen</h3>
            <p>Erstellen Sie ein komplett neues Exposé von Grund auf</p>
            {selectedAction === 'new' && (
              <div className="action-controls">
                <button className="btn-primary" onClick={handleCreateNew}>
                  Neu erstellen
                </button>
              </div>
            )}
          </div>

          {/* Bestehendes Exposé bearbeiten */}
          <div 
            className={`action-card ${selectedAction === 'edit' ? 'selected' : ''}`}
            onClick={() => setSelectedAction('edit')}
          >
            <div className="action-icon">✏️</div>
            <h3>Bestehendes Exposé bearbeiten</h3>
            <p>Öffnen und bearbeiten Sie ein bereits gespeichertes Exposé</p>
            {selectedAction === 'edit' && (
              <div className="action-controls">
                {exposeList.length > 0 ? (
                  <>
                    <select 
                      value={selectedExposeId} 
                      onChange={(e) => setSelectedExposeId(e.target.value)}
                      className="expose-select"
                    >
                      <option value="">Exposé auswählen...</option>
                      {exposeList.map(expose => (
                        <option key={expose.id} value={expose.id}>
                          {expose.fileName} ({formatDate(expose.updatedAt)})
                        </option>
                      ))}
                    </select>
                    <button 
                      className="btn-primary" 
                      onClick={handleEditExisting}
                      disabled={!selectedExposeId}
                    >
                      Bearbeiten
                    </button>
                  </>
                ) : (
                  <p className="no-files">Keine gespeicherten Exposés vorhanden</p>
                )}
              </div>
            )}
          </div>

          {/* Exposé kopieren und bearbeiten */}
          <div 
            className={`action-card ${selectedAction === 'copy' ? 'selected' : ''}`}
            onClick={() => setSelectedAction('copy')}
          >
            <div className="action-icon">📋</div>
            <h3>Exposé kopieren und bearbeiten</h3>
            <p>Erstellen Sie eine Kopie eines bestehenden Exposés mit neuen Daten</p>
            {selectedAction === 'copy' && (
              <div className="action-controls">
                {exposeList.length > 0 ? (
                  <>
                    <select 
                      value={selectedExposeId} 
                      onChange={(e) => setSelectedExposeId(e.target.value)}
                      className="expose-select"
                    >
                      <option value="">Exposé zum Kopieren auswählen...</option>
                      {exposeList.map(expose => (
                        <option key={expose.id} value={expose.id}>
                          {expose.fileName} ({formatDate(expose.updatedAt)})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Neues Merkmal eingeben..."
                      value={copyMerkmal}
                      onChange={(e) => setCopyMerkmal(e.target.value)}
                      className="merkmal-input"
                    />
                    <button 
                      className="btn-primary" 
                      onClick={handleCopyExisting}
                      disabled={!selectedExposeId || !copyMerkmal.trim()}
                    >
                      Kopieren und bearbeiten
                    </button>
                  </>
                ) : (
                  <p className="no-files">Keine gespeicherten Exposés vorhanden</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Gespeicherte Exposés anzeigen */}
        {exposeList.length > 0 && (
          <div className="saved-exposes">
            <h3>Gespeicherte Exposés</h3>
            <div className="expose-list">
              {exposeList.map(expose => (
                <div key={expose.id} className="expose-item">
                  <div className="expose-info">
                    <div className="expose-name">{expose.fileName}</div>
                    <div className="expose-details">
                      <span className="expose-address">{expose.address}</span>
                      <span className="expose-merkmal">Merkmal: {expose.userMerkmal}</span>
                    </div>
                    <div className="expose-dates">
                      <span>Erstellt: {formatDate(expose.createdAt)}</span>
                      <span>Geändert: {formatDate(expose.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="expose-actions">
                    <button 
                      className="btn-secondary" 
                      onClick={() => onLoadExisting(expose.id)}
                    >
                      Öffnen
                    </button>
                    <button 
                      className="btn-danger" 
                      onClick={() => setShowConfirmDelete(expose.id)}
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bestätigungsdialog für Löschen */}
        {showConfirmDelete && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Exposé löschen</h3>
              <p>Sind Sie sicher, dass Sie dieses Exposé löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.</p>
              <div className="modal-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowConfirmDelete(null)}
                >
                  Abbrechen
                </button>
                <button 
                  className="btn-danger" 
                  onClick={() => handleDeleteExpose(showConfirmDelete)}
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};