import { useState } from 'react';

interface TextFieldProps {
  id: string;
  label: string;
  value?: string;
  onChange: any;
  required?: boolean;
  pattern?: string;
  type?: string;
  min?: string;
  max?: string;
    className?: string;
    style?: React.CSSProperties;
}

export function TextField({ 
  id, 
  label, 
  value = '', 
  onChange,
  required = false,
  pattern,
  type = "text",
  min,
  max,
  className = '',
  style = {}
}: TextFieldProps) {
  const [error, setError] = useState<string>("");
  const [showAI, setShowAI] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Simple validation
    if (required && !newValue.trim()) {
      setError(`${label} ist erforderlich`);
    } else {
      setError("");
    }

    // Call onChange in multiple ways to be compatible
    try {
      onChange((prev: any) => ({
        ...prev,
        [id]: newValue
      }));
    } catch {
      try {
        onChange({ [id]: newValue });
      } catch {
        onChange(newValue);
      }
    }
  };

  const generateAIText = () => {
    const suggestions = {
      titel: "Moderne 3-Zimmer-Wohnung in bester Lage",
      adresse: "Musterstraße 123, 12345 Musterstadt",
      lage: "Zentrale Lage mit ausgezeichneter Verkehrsanbindung",
      baujahr: "2010",
      wohnflaeche: "85",
      verkaufspreis: "295000"
    };

    const suggestion = suggestions[id as keyof typeof suggestions] || `Beispieltext für ${label}`;
    
    const event = {
      target: { value: suggestion }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleChange(event);
  };

  return (
      <div className={`form-group ${className}`} style={style}>
      <label className="ui-label" htmlFor={id}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      
      <div className="input-container">
        <input
          id={id}
          type={type}
          className={`ui-input ${error ? 'error' : ''}`}
          value={value}
          onChange={handleChange}
          required={required}
          pattern={pattern}
          min={min}
          max={max}
          placeholder={`${label} eingeben...`}
        />
        
        <button 
          type="button"
          className="ai-button"
          onClick={() => setShowAI(!showAI)}
          title="KI-Funktionen anzeigen"
        >
          🤖
        </button>
      </div>

      {showAI && (
        <div className="ai-panel">
          <button 
            type="button" 
            className="ai-generate-btn"
            onClick={generateAIText}
          >
            ✨ Vorschlag generieren
          </button>
          <div className="ai-features">
            <small>🔮 KI-Textgenerierung | 📷 Kamera | 💾 Auto-Save</small>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}
    </div>
  );
}