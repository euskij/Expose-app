import React, { useState, useRef } from 'react';
import { ExposeStartScreen } from './components/ExposeStartScreen';
import { SaveExposeDialog } from './components/SaveExposeDialog';
import { ExposeFileManager } from './services/exposeFileManager';
import AppProfessional from './App-professional';

interface ImmobilienData {
  titel: string;
  adresse: string;
  lage: string;
  objektTyp: string;
  baujahr: string;
  wohnflaeche: string;
  grundstuecksflaeche: string;
  zimmer: string;
  badezimmer: string;
  balkone: string;
  anzahl_garagen: string;
  anzahl_stellplaetze: string;
  garage: string;
  keller: string;
  anzahl_wohnungen: string;
  anzahl_gewerbeeinheiten: string;
  leerstehende_wohnungen: string;
  leerstehende_gewerbe: string;
  qm_leerstand_wohnungen: string;
  qm_leerstand_gewerbe: string;
  verkaufspreis: string;
  ist_miete: string;
  soll_miete: string;
  betriebskosten_hausgeld: string;
  maklercourtage: string;
  ist_faktor: string;
  soll_faktor: string;
  watermark_text: string;
  heizungsart: string;
  energietraeger: string;
  bauzustand: string;
  kurzbeschreibung: string;
  langbeschreibung: string;
  ausstattung: string;
  lage_beschreibung: string;
  [key: string]: string;
}

type AppMode = 'startscreen' | 'editor';

export const AppWithFileManager: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('startscreen');
  const [currentExposeId, setCurrentExposeId] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [currentMerkmal, setCurrentMerkmal] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [initialData, setInitialData] = useState<ImmobilienData | null>(null);
  const [initialPhotos, setInitialPhotos] = useState<string[]>([]);
  const [currentData, setCurrentData] = useState<ImmobilienData | null>(null);
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);
  const editorRef = useRef<any>(null);

  const emptyData: ImmobilienData = {
    titel: '',
    adresse: '',
    lage: '',
    objektTyp: 'wohnung',
    baujahr: '',
    wohnflaeche: '',
    grundstuecksflaeche: '',
    zimmer: '',
    badezimmer: '',
    balkone: '',
    anzahl_garagen: '',
    anzahl_stellplaetze: '',
    garage: '',
    keller: '',
    anzahl_wohnungen: '',
    anzahl_gewerbeeinheiten: '',
    leerstehende_wohnungen: '',
    leerstehende_gewerbe: '',
    qm_leerstand_wohnungen: '',
    qm_leerstand_gewerbe: '',
    verkaufspreis: '',
    ist_miete: '',
    soll_miete: '',
    betriebskosten_hausgeld: '',
    maklercourtage: '',
    ist_faktor: '',
    soll_faktor: '',
    watermark_text: '',
    heizungsart: '',
    energietraeger: '',
    bauzustand: '',
    kurzbeschreibung: '',
    langbeschreibung: '',
    ausstattung: '',
    lage_beschreibung: ''
  };

  const handleCreateNew = () => {
    setCurrentExposeId(null);
    setCurrentFileName('');
    setCurrentMerkmal('');
    setInitialData(emptyData);
    setInitialPhotos([]);
    setMode('editor');
  };

  const handleLoadExisting = (exposeId: string) => {
    const expose = ExposeFileManager.loadExpose(exposeId);
    if (expose) {
      setCurrentExposeId(expose.id);
      setCurrentFileName(expose.fileName);
      setCurrentMerkmal(expose.userMerkmal);
      setInitialData(expose.data);
      setInitialPhotos(expose.photos);
      setMode('editor');
    }
  };

  const handleCopyExisting = (newExposeId: string, newMerkmal: string) => {
    const expose = ExposeFileManager.loadExpose(newExposeId);
    if (expose) {
      setCurrentExposeId(newExposeId);
      setCurrentFileName(expose.fileName);
      setCurrentMerkmal(newMerkmal);
      setInitialData(expose.data);
      setInitialPhotos(expose.photos);
      setMode('editor');
    }
  };

  const handleBackToStart = () => {
    setMode('startscreen');
    setCurrentExposeId(null);
    setCurrentFileName('');
    setCurrentMerkmal('');
    setInitialData(null);
    setInitialPhotos([]);
  };

  const handleSaveRequest = () => {
    setShowSaveDialog(true);
  };

  const handleSaveComplete = (savedId: string, fileName: string) => {
    setCurrentExposeId(savedId);
    setCurrentFileName(fileName);
    setShowSaveDialog(false);
    // Optional: Nachricht anzeigen oder zur Startseite zurückkehren
  };

  const handleSaveCancel = () => {
    setShowSaveDialog(false);
  };

  const handleDataChange = (newData: ImmobilienData, newPhotos: string[]) => {
    setCurrentData(newData);
    setCurrentPhotos(newPhotos);
  };

  if (mode === 'startscreen') {
    return (
      <ExposeStartScreen
        onCreateNew={handleCreateNew}
        onLoadExisting={handleLoadExisting}
        onCopyExisting={handleCopyExisting}
      />
    );
  }

  return (
    <>
      <AppProfessional
        initialData={initialData}
        initialPhotos={initialPhotos}
        currentExposeId={currentExposeId}
        currentFileName={currentFileName}
        onBackToStart={handleBackToStart}
        onSaveRequest={handleSaveRequest}
        onDataChange={handleDataChange}
      />
      
      {showSaveDialog && currentData && (
        <SaveExposeDialog
          isOpen={showSaveDialog}
          currentExposeId={currentExposeId}
          currentAddress={currentData.adresse}
          currentMerkmal={currentMerkmal}
          data={currentData}
          photos={currentPhotos}
          onSave={handleSaveComplete}
          onCancel={handleSaveCancel}
        />
      )}
    </>
  );
};