import { useState, useEffect } from 'react';
import { TextField } from './components/TextField-working';
import { EnergieausweisUpload } from './components/EnergieausweisUpload';
import { TextPreviewModal } from './components/TextPreviewModal-professional';
import { ExposePDF } from './components/ExposePDF';
import './styles-business.css';

interface ImmobilienData {
  // Grunddaten
  titel: string;
  adresse: string;
  lage: string;
  objektTyp: string;
  
  // Technische Daten
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
  
  // Mehrfamilienhaus-spezifische Felder
  anzahl_wohnungen: string;
  anzahl_gewerbeeinheiten: string;
  leerstehende_wohnungen: string;
  leerstehende_gewerbe: string;
  qm_leerstand_wohnungen: string;
  qm_leerstand_gewerbe: string;
  
  // Finanzielle Daten
  verkaufspreis: string;
  ist_miete: string;
  soll_miete: string;
  betriebskosten_hausgeld: string;
  maklercourtage: string;
  ist_faktor: string;
  soll_faktor: string;
  watermark_text: string;
  
  // Technische Details
  heizungsart: string;
  energietraeger: string;
  bauzustand: string;
  
  // Beschreibungen
  kurzbeschreibung: string;
  langbeschreibung: string;
  ausstattung: string;
  lage_beschreibung: string;
  
  [key: string]: string;
}

interface AppProfessionalProps {
  initialData?: ImmobilienData | null;
  initialPhotos?: string[];
  currentExposeId?: string | null;
  currentFileName?: string;
  onBackToStart?: () => void;
  onSaveRequest?: () => void;
  onDataChange?: (data: ImmobilienData, photos: string[]) => void;
}

function AppProfessional({
  initialData = null,
  initialPhotos = [],
  currentExposeId = null,
  currentFileName = '',
  onBackToStart,
  onSaveRequest,
  onDataChange
}: AppProfessionalProps) {
  // Universelle Felder (für alle Objekttypen sichtbar)
  const universalFields = [
    'titel', 'adresse', 'lage', 'objektTyp', 'baujahr', 'wohnflaeche', 
    'verkaufspreis', 'heizungsart', 'bauzustand', 'anzahl_garagen', 'anzahl_stellplaetze',
    'kurzbeschreibung', 'langbeschreibung', 'ausstattung', 'lage_beschreibung', 'watermark_text'
  ];

  // Objekttyp-spezifische Felder
  const typeSpecificFields = {
    wohnung: ['zimmer', 'badezimmer', 'balkone', 'ist_miete', 'soll_miete', 'betriebskosten_hausgeld', 'ist_faktor', 'soll_faktor'],
    mehrfamilienhaus: ['grundstuecksflaeche', 'ist_miete', 'soll_miete', 'ist_faktor', 'soll_faktor', 'garage', 'keller', 
                       'anzahl_wohnungen', 'anzahl_gewerbeeinheiten', 'leerstehende_wohnungen', 'leerstehende_gewerbe', 
                       'qm_leerstand_wohnungen', 'qm_leerstand_gewerbe'],
    einfamilienhaus: ['zimmer', 'badezimmer', 'grundstuecksflaeche', 'garage', 'keller', 'balkone'],
    doppelhaushälfte: ['zimmer', 'badezimmer', 'grundstuecksflaeche', 'garage', 'keller', 'balkone']
  };

  // Funktion zum Prüfen ob ein Feld angezeigt werden soll
  const shouldShowField = (fieldName: string): boolean => {
    if (universalFields.includes(fieldName)) {
      return true;
    }
    const specificFields = typeSpecificFields[data.objektTyp as keyof typeof typeSpecificFields] || [];
    return specificFields.includes(fieldName);
  };

  // Berechnungslogik für Faktoren
  const calculateFactors = (verkaufspreis: string, istMiete: string, sollMiete: string) => {
    const preis = parseFloat(verkaufspreis) || 0;
    const istMieteNum = parseFloat(istMiete) || 0;
    const sollMieteNum = parseFloat(sollMiete) || 0;
    
    const istFaktor = istMieteNum > 0 ? (preis / (istMieteNum * 12)).toFixed(2) : '';
    const sollFaktor = sollMieteNum > 0 ? (preis / (sollMieteNum * 12)).toFixed(2) : '';
    
    return { istFaktor, sollFaktor };
  };

  // Funktion zum Prüfen ob ein Feld leer/null ist
  const isFieldEmpty = (value: string): boolean => {
    return !value || value === '0' || value === '-' || value.trim() === '';
  };

  // Standard-Daten für neue Exposés
  const defaultData: ImmobilienData = {
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

  const [data, setData] = useState<ImmobilienData>(initialData || defaultData);
  const [photos, setPhotos] = useState<string[]>(initialPhotos || []);
  const [activeTab, setActiveTab] = useState('grunddaten');
  const [showPreview, setShowPreview] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [generatedTexts, setGeneratedTexts] = useState<any>({});

  // Lade initialData wenn sich diese ändert
  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (initialPhotos) {
      setPhotos(initialPhotos);
    }
  }, [initialPhotos]);

  // Melde Datenänderungen an Parent-Komponente
  useEffect(() => {
    if (onDataChange) {
      onDataChange(data, photos);
    }
  }, [data, photos, onDataChange]);

  const handleChange = (field: string, value: string) => {
    setData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Automatische Berechnung der Faktoren wenn sich relevante Felder ändern
      if (field === 'verkaufspreis' || field === 'ist_miete' || field === 'soll_miete') {
        const { istFaktor, sollFaktor } = calculateFactors(
          field === 'verkaufspreis' ? value : newData.verkaufspreis,
          field === 'ist_miete' ? value : newData.ist_miete,
          field === 'soll_miete' ? value : newData.soll_miete
        );
        newData.ist_faktor = istFaktor;
        newData.soll_faktor = sollFaktor;
      }
      
      return newData;
    });
  };

  const handleFieldUpdate = (update: any) => {
    setData(prev => ({ ...prev, ...update }));
  };

  const addPhoto = (photoUrl: string) => {
    setPhotos(prev => [...prev, photoUrl]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const generateAllTexts = async () => {
    // Mock AI text generation
    const generated = {
      titel: `${data.objektTyp === 'haus' ? 'Einfamilienhaus' : 'Moderne Wohnung'} in ${data.lage || 'bester Lage'}`,
      kurzbeschreibung: `Attraktive ${data.zimmer}-Zimmer-${data.objektTyp} mit ${data.wohnflaeche}m² Wohnfläche in ${data.lage}. Baujahr ${data.baujahr}, ${data.heizungsart}, ${data.bauzustand}.`,
      langbeschreibung: `Diese wunderschöne ${data.objektTyp} überzeugt durch ihre ${data.lage_beschreibung}. Mit ${data.wohnflaeche}m² Wohnfläche bietet sie genügend Platz für ${data.zimmer} Zimmer. Die Immobilie wurde ${data.baujahr} erbaut und befindet sich in einem ${data.bauzustand} Zustand.`,
      ausstattung: `• ${data.zimmer} Zimmer, ${data.badezimmer} Badezimmer\n• ${data.heizungsart}\n• ${data.balkone ? `${data.balkone} Balkon(e)` : 'Ohne Balkon'}\n• ${data.garage ? 'Garage vorhanden' : 'Keine Garage'}\n• ${data.keller ? 'Keller vorhanden' : 'Kein Keller'}`,
      lage_beschreibung: `Die Immobilie befindet sich in ${data.lage}. Die zentrale Lage bietet eine ausgezeichnete Verkehrsanbindung und Infrastruktur mit Einkaufsmöglichkeiten, Schulen und öffentlichen Verkehrsmitteln in unmittelbarer Nähe.`
    };
    
    setGeneratedTexts(generated);
    setData(prev => ({ ...prev, ...generated }));
  };

  const tabs = [
    { id: 'grunddaten', label: '📋 Grunddaten', icon: '🏠' },
    { id: 'technisch', label: '🔧 Technik', icon: '⚙️' },
    { id: 'finanzen', label: '💰 Finanzen', icon: '💶' },
    { id: 'beschreibung', label: '📝 Texte', icon: '✍️' },
    { id: 'fotos', label: '📸 Fotos', icon: '🖼️' },
    { id: 'vorschau', label: '👁️ Vorschau', icon: '🔍' }
  ];

  return (
    <div className="app">
      {/* Watermark */}
      {data.watermark_text && (
        <div className="app-watermark">
          {data.watermark_text}
        </div>
      )}
      
      <div className="container">
        <header className="header">
          <div className="header-content">
            <div className="header-left">
              <h1>🏠 Exposé-App</h1>
              <p>Professionelle Immobilien-Exposés erstellen</p>
              {currentFileName && (
                <p className="current-file">Datei: {currentFileName}</p>
              )}
            </div>
            <div className="header-actions">
              {onBackToStart && (
                <button 
                  className="btn btn-secondary"
                  onClick={onBackToStart}
                >
                  ← Zurück zur Übersicht
                </button>
              )}
              {onSaveRequest && (
                <button 
                  className="btn btn-primary"
                  onClick={onSaveRequest}
                >
                  💾 Speichern
                </button>
              )}
              <button 
                className="btn btn-primary"
                onClick={generateAllTexts}
              >
                ✨ KI-Texte generieren
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowPreview(true)}
              >
                👁️ Vorschau anzeigen
              </button>
            </div>
          </div>
        </header>

        <nav className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <main className="main-content">
          {activeTab === 'grunddaten' && (
            <section className="form-section">
              <h2>📋 Grunddaten der Immobilie</h2>
              <div className="form-grid">
                <TextField 
                  id="titel" 
                  label="Exposé-Titel" 
                  value={data.titel} 
                  onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('titel', fn)}
                  required
                />
                
                <div className="form-group">
                  <label className="ui-label">Objekttyp *</label>
                  <select 
                    className="ui-select"
                    value={data.objektTyp}
                    onChange={(e) => handleChange('objektTyp', e.target.value)}
                  >
                    <option value="wohnung">Wohnung</option>
                    <option value="mehrfamilienhaus">Mehrfamilienhaus</option>
                    <option value="einfamilienhaus">Einfamilienhaus</option>
                    <option value="doppelhaushälfte">Doppelhaushälfte</option>
                  </select>
                </div>

                <TextField 
                  id="adresse" 
                  label="Vollständige Adresse" 
                  value={data.adresse} 
                  onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('adresse', fn)}
                  required
                />
                
                <TextField 
                  id="lage" 
                  label="Lage/Stadtteil" 
                  value={data.lage} 
                  onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('lage', fn)}
                />

                {shouldShowField('zimmer') && (
                  <TextField 
                    id="zimmer" 
                    label="Anzahl Zimmer" 
                    value={data.zimmer} 
                    onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('zimmer', fn)}
                    type="number"
                    min="1"
                  />
                )}

                {shouldShowField('badezimmer') && (
                  <TextField 
                    id="badezimmer" 
                    label="Anzahl Badezimmer" 
                    value={data.badezimmer} 
                    onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('badezimmer', fn)}
                    type="number"
                    min="1"
                  />
                )}

                <TextField 
                  id="watermark_text" 
                  label="Watermark-Text" 
                  value={data.watermark_text} 
                  onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('watermark_text', fn)}
                />
              </div>
            </section>
          )}

          {activeTab === 'technisch' && (
            <section className="form-section">
              <h2>🔧 Technische Daten</h2>
              <div className="form-grid">
                <TextField 
                  id="baujahr" 
                  label="Baujahr" 
                  value={data.baujahr} 
                  onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('baujahr', fn)}
                  type="number"
                  min="1800"
                  max="2025"
                />

                <TextField 
                  id="wohnflaeche" 
                  label="Wohnfläche (m²)" 
                  value={data.wohnflaeche} 
                  onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('wohnflaeche', fn)}
                  type="number"
                />

                <TextField 
                  id="anzahl_garagen" 
                  label="Anzahl Garagen" 
                  value={data.anzahl_garagen} 
                  onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('anzahl_garagen', fn)}
                  type="number"
                  min="0"
                />

                <TextField 
                  id="anzahl_stellplaetze" 
                  label="Anzahl Stellplätze" 
                  value={data.anzahl_stellplaetze} 
                  onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('anzahl_stellplaetze', fn)}
                  type="number"
                  min="0"
                />

                {shouldShowField('grundstuecksflaeche') && (
                  <TextField 
                    id="grundstuecksflaeche" 
                    label="Grundstücksfläche (m²)" 
                    value={data.grundstuecksflaeche} 
                    onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('grundstuecksflaeche', fn)}
                    type="number"
                  />
                )}

                <div className="form-group">
                  <label className="ui-label">Heizungsart</label>
                  <select 
                    className="ui-select"
                    value={data.heizungsart}
                    onChange={(e) => handleChange('heizungsart', e.target.value)}
                  >
                    <option value="">Bitte wählen</option>
                    <option value="Zentralheizung">Zentralheizung</option>
                    <option value="Gasetagenheizung">Gasetagenheizung</option>
                    <option value="Fernwärme">Fernwärme</option>
                    <option value="Wärmepumpe">Wärmepumpe</option>
                    <option value="Öl">Ölheizung</option>
                    <option value="Elektro">Elektroheizung</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="ui-label">Bauzustand</label>
                  <select 
                    className="ui-select"
                    value={data.bauzustand}
                    onChange={(e) => handleChange('bauzustand', e.target.value)}
                  >
                    <option value="">Bitte wählen</option>
                    <option value="Erstbezug">Erstbezug</option>
                    <option value="Neubau">Neubau</option>
                    <option value="Sehr gut">Sehr gut</option>
                    <option value="Gut">Gut</option>
                    <option value="Renovierungsbedürftig">Renovierungsbedürftig</option>
                    <option value="Sanierungsbedürftig">Sanierungsbedürftig</option>
                  </select>
                </div>

                {shouldShowField('balkone') && (
                  <TextField 
                    id="balkone" 
                    label="Anzahl Balkone/Terrassen" 
                    value={data.balkone} 
                    onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('balkone', fn)}
                    type="number"
                    min="0"
                  />
                )}

                {shouldShowField('garage') && (
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={data.garage === 'ja'}
                        onChange={(e) => handleChange('garage', e.target.checked ? 'ja' : 'nein')}
                      />
                      Garage/Stellplatz vorhanden
                    </label>
                  </div>
                )}

                {shouldShowField('keller') && (
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={data.keller === 'ja'}
                        onChange={(e) => handleChange('keller', e.target.checked ? 'ja' : 'nein')}
                      />
                      Keller vorhanden
                    </label>
                  </div>
                )}

                {/* Mehrfamilienhaus-spezifische Felder */}
                {shouldShowField('anzahl_wohnungen') && (
                  <TextField 
                    id="anzahl_wohnungen" 
                    label="Anzahl Wohnungen" 
                    value={data.anzahl_wohnungen} 
                    onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('anzahl_wohnungen', fn)}
                    type="number"
                    min="1"
                  />
                )}

                {shouldShowField('anzahl_gewerbeeinheiten') && (
                  <TextField 
                    id="anzahl_gewerbeeinheiten" 
                    label="Anzahl Gewerbeeinheiten" 
                    value={data.anzahl_gewerbeeinheiten} 
                    onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('anzahl_gewerbeeinheiten', fn)}
                    type="number"
                    min="0"
                  />
                )}

                {shouldShowField('leerstehende_wohnungen') && (
                  <TextField 
                    id="leerstehende_wohnungen" 
                    label="Leerstehende Wohnungen" 
                    value={data.leerstehende_wohnungen} 
                    onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('leerstehende_wohnungen', fn)}
                    type="number"
                    min="0"
                  />
                )}

                {shouldShowField('leerstehende_gewerbe') && (
                  <TextField 
                    id="leerstehende_gewerbe" 
                    label="Leerstehende Gewerbeeinheiten" 
                    value={data.leerstehende_gewerbe} 
                    onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('leerstehende_gewerbe', fn)}
                    type="number"
                    min="0"
                  />
                )}

                {shouldShowField('qm_leerstand_wohnungen') && (
                  <TextField 
                    id="qm_leerstand_wohnungen" 
                    label="m² Leerstand Wohnungen" 
                    value={data.qm_leerstand_wohnungen} 
                    onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('qm_leerstand_wohnungen', fn)}
                    type="number"
                    min="0"
                  />
                )}

                {shouldShowField('qm_leerstand_gewerbe') && (
                  <TextField 
                    id="qm_leerstand_gewerbe" 
                    label="m² Leerstand Gewerbe" 
                    value={data.qm_leerstand_gewerbe} 
                    onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('qm_leerstand_gewerbe', fn)}
                    type="number"
                    min="0"
                  />
                )}
              </div>

              <div className="upload-section">
                <h3>📄 Energieausweis</h3>
                <EnergieausweisUpload onDataExtracted={handleFieldUpdate} />
              </div>
            </section>
          )}

          {activeTab === 'finanzen' && (
            <section className="form-section">
              <h2>💰 Finanzielle Daten</h2>
              <div className="form-grid">
                <TextField 
                  id="verkaufspreis" 
                  label="Verkaufspreis (€)" 
                  value={data.verkaufspreis} 
                  onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('verkaufspreis', fn)}
                  type="number"
                />

                {shouldShowField('ist_miete') && (
                  <TextField 
                    id="ist_miete" 
                    label="IST-Miete / Monat (€)" 
                    value={data.ist_miete} 
                    onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('ist_miete', fn)}
                    type="number"
                  />
                )}

                {shouldShowField('soll_miete') && (
                  <TextField 
                    id="soll_miete" 
                    label="SOLL-Miete / Monat (€)" 
                    value={data.soll_miete} 
                    onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('soll_miete', fn)}
                    type="number"
                  />
                )}

                {shouldShowField('betriebskosten_hausgeld') && (
                  <TextField 
                    id="betriebskosten_hausgeld" 
                    label="Betriebskosten/Hausgeld (€/Monat)" 
                    value={data.betriebskosten_hausgeld} 
                    onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('betriebskosten_hausgeld', fn)}
                    type="number"
                  />
                )}

                <TextField 
                  id="maklercourtage" 
                  label="Maklercourtage (%)" 
                  value={data.maklercourtage} 
                  onChange={(fn: any) => typeof fn === 'function' ? setData(fn) : handleChange('maklercourtage', fn)}
                  type="number"
                  min="0"
                  max="10"
                />

                {shouldShowField('ist_faktor') && (
                  <div className="form-group">
                    <label className="ui-label">IST-Faktor (berechnet)</label>
                    <input 
                      className="ui-input calculated-field"
                      value={data.ist_faktor}
                      readOnly
                      placeholder="Wird automatisch berechnet"
                    />
                  </div>
                )}

                {shouldShowField('soll_faktor') && (
                  <div className="form-group">
                    <label className="ui-label">SOLL-Faktor (berechnet)</label>
                    <input 
                      className="ui-input calculated-field"
                      value={data.soll_faktor}
                      readOnly
                      placeholder="Wird automatisch berechnet"
                    />
                  </div>
                )}
              </div>

              <div className="calculation-summary">
                <h3>📊 Berechnungen</h3>
                <div className="calc-grid">
                  <div className="calc-item">
                    <span>Bruttomietrendite:</span>
                    <span>{data.verkaufspreis && data.ist_miete ? 
                      ((parseFloat(data.ist_miete) * 12 / parseFloat(data.verkaufspreis)) * 100).toFixed(2) + '%' 
                      : '--'}</span>
                  </div>
                  <div className="calc-item">
                    <span>Quadratmeterpreis:</span>
                    <span>{data.verkaufspreis && data.wohnflaeche ? 
                      (parseFloat(data.verkaufspreis) / parseFloat(data.wohnflaeche)).toFixed(0) + '€/m²' 
                      : '--'}</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'beschreibung' && (
            <section className="form-section">
              <h2>📝 Beschreibungstexte</h2>
              
              <div className="text-field-full">
                <label className="ui-label">Kurzbeschreibung</label>
                <textarea 
                  className="ui-textarea"
                  value={data.kurzbeschreibung}
                  onChange={(e) => handleChange('kurzbeschreibung', e.target.value)}
                  placeholder="Kurze, prägnante Beschreibung der Immobilie..."
                  rows={3}
                />
              </div>

              <div className="text-field-full">
                <label className="ui-label">Ausführliche Beschreibung</label>
                <textarea 
                  className="ui-textarea"
                  value={data.langbeschreibung}
                  onChange={(e) => handleChange('langbeschreibung', e.target.value)}
                  placeholder="Detaillierte Beschreibung der Immobilie, Zimmeraufteilung, Besonderheiten..."
                  rows={6}
                />
              </div>

              <div className="text-field-full">
                <label className="ui-label">Ausstattung</label>
                <textarea 
                  className="ui-textarea"
                  value={data.ausstattung}
                  onChange={(e) => handleChange('ausstattung', e.target.value)}
                  placeholder="Ausstattungsmerkmale, Einbauküche, Bodenbeläge, Sanitäranlagen..."
                  rows={4}
                />
              </div>

              <div className="text-field-full">
                <label className="ui-label">Lage & Umgebung</label>
                <textarea 
                  className="ui-textarea"
                  value={data.lage_beschreibung}
                  onChange={(e) => handleChange('lage_beschreibung', e.target.value)}
                  placeholder="Beschreibung der Lage, Verkehrsanbindung, Infrastruktur, Einkaufsmöglichkeiten..."
                  rows={4}
                />
              </div>

              {Object.keys(generatedTexts).length > 0 && (
                <div className="generated-texts">
                  <h3>🤖 KI-generierte Texte</h3>
                  <p className="text-muted">Die folgenden Texte wurden automatisch generiert und können bearbeitet werden:</p>
                  {Object.entries(generatedTexts).map(([key, value]) => (
                    <div key={key} className="generated-text-item">
                      <strong>{key}:</strong> {value as string}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'fotos' && (
            <section className="form-section">
              <h2>📸 Immobilienfotos</h2>
              
              <div className="photo-upload">
                <div className="upload-area">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    id="photo-upload"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files) {
                        Array.from(e.target.files).forEach(file => {
                          const url = URL.createObjectURL(file);
                          addPhoto(url);
                        });
                      }
                    }}
                  />
                  <label htmlFor="photo-upload" className="upload-label">
                    <div className="upload-content">
                      <span className="upload-icon">📸</span>
                      <span>Fotos hinzufügen</span>
                      <span className="upload-hint">Klicken oder Dateien hierher ziehen</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="photo-grid">
                {photos.map((photo, index) => (
                  <div key={index} className="photo-item">
                    <img src={photo} alt={`Foto ${index + 1}`} className="photo-thumbnail" />
                    <button 
                      className="photo-remove"
                      onClick={() => removePhoto(index)}
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>

              <div className="camera-integration">
                <h3>📷 Kamera-Integration</h3>
                <div className="camera-controls">
                  <button className="btn btn-secondary">📷 Kamera starten</button>
                  <button className="btn btn-secondary">🎯 Foto aufnehmen</button>
                </div>
                <p className="text-muted">Verwenden Sie die Gerätekamera für direkte Fotoaufnahmen</p>
              </div>
            </section>
          )}

          {activeTab === 'vorschau' && (
            <section className="form-section">
              <h2>👁️ Exposé-Vorschau</h2>
              
              <div className="preview-controls">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowPreview(true)}
                >
                  📄 Vollständige Vorschau öffnen
                </button>
                <button className="btn btn-secondary">
                  💾 Entwurf speichern
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowPDF(true)}
                >
                  📧 PDF generieren
                </button>
              </div>

              {/* Inline-Vorschau - identisch mit der Modal-Vorschau */}
              <div className="expose-preview-inline">
                {/* Header */}
                <div className="expose-header">
                  <h1 className="expose-title">{data.titel || 'Immobilien-Exposé'}</h1>
                  <div className="expose-address">{data.adresse}</div>
                </div>

                {/* Key Facts */}
                {(data.verkaufspreis || data.wohnflaeche || data.baujahr) && (
                  <div className="key-facts">
                    <h3>🔑 Eckdaten</h3>
                    <div className="facts-grid">
                      {data.verkaufspreis && (
                        <div className="fact-item">
                          <div className="fact-label">Kaufpreis</div>
                          <div className="fact-value">{parseInt(data.verkaufspreis).toLocaleString()} €</div>
                        </div>
                      )}
                      {data.wohnflaeche && (
                        <div className="fact-item">
                          <div className="fact-label">Wohnfläche</div>
                          <div className="fact-value">{data.wohnflaeche} m²</div>
                        </div>
                      )}
                      {data.baujahr && (
                        <div className="fact-item">
                          <div className="fact-label">Baujahr</div>
                          <div className="fact-value">{data.baujahr}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {photos.length > 0 && (
                  <div className="expose-section">
                    <h3>📸 Bilder</h3>
                    <div className="expose-photos">
                      <div className="main-photo photo-container">
                        <img src={photos[0]} alt="Hauptfoto" style={{width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'cover'}} />
                        {data.watermark_text && (
                          <>
                            <div className="photo-watermark">{data.watermark_text}</div>
                            <div className="photo-watermark-1">{data.watermark_text}</div>
                            <div className="photo-watermark-2">{data.watermark_text}</div>
                            <div className="photo-watermark-3">{data.watermark_text}</div>
                            <div className="photo-watermark-4">{data.watermark_text}</div>
                          </>
                        )}
                      </div>
                      {photos.slice(1, 5).length > 0 && (
                        <div className="thumbnail-photos" style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                          {photos.slice(1, 5).map((photo, index) => (
                            <div key={index} className="thumbnail-container photo-container" style={{flex: '1', maxWidth: '120px'}}>
                              <img src={photo} alt={`Foto ${index + 2}`} style={{width: '100%', height: '80px', objectFit: 'cover'}} />
                              {data.watermark_text && (
                                <>
                                  <div className="photo-watermark">{data.watermark_text}</div>
                                  <div className="photo-watermark-1">{data.watermark_text}</div>
                                  <div className="photo-watermark-2">{data.watermark_text}</div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Beschreibung */}
                {data.kurzbeschreibung && (
                  <div className="expose-section">
                    <h3>📝 Kurzbeschreibung</h3>
                    <div className="description-text">
                      {data.kurzbeschreibung.split('\n').map((line: string, index: number) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>

        {showPreview && (
          <TextPreviewModal
            data={data}
            photos={photos}
            isOpen={showPreview}
            onClose={() => setShowPreview(false)}
          />
        )}

        {showPDF && (
          <div className="pdf-modal">
            <div className="pdf-modal-content">
              <div className="pdf-modal-header">
                <h2>📄 PDF-Vorschau</h2>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowPDF(false)}
                >
                  ✕ Schließen
                </button>
              </div>
              <ExposePDF data={data} photos={photos} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppProfessional;