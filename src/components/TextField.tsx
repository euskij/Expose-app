import React, { useState, useRef } from 'react';
import useTextGeneration from '../hooks/useTextGeneration';

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
}

export function TextField({ 
  id, 
  label, 
  value, 
  onChange,
  required = false,
  pattern,
  type = "text",
  min,
  max
}: TextFieldProps) {
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string>("");
  const { generatedText, generateText } = useTextGeneration();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const validate = (value: string | undefined) => {
    if (required && (!value || value.trim() === '')) {
      return `${label} ist erforderlich`;
    }
    if (value && pattern && !new RegExp(pattern).test(value)) {
      return `${label} hat ein ungültiges Format`;
    }
    if (value && type === "number") {
      const num = Number(value);
      if (min && num < Number(min)) {
        return `${label} muss mindestens ${min} sein`;
      }
      if (max && num > Number(max)) {
        return `${label} darf maximal ${max} sein`;
      }
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const validationError = validate(newValue);
    setError(validationError);
    
    // Try different onChange patterns to be compatible
    try {
      onChange((prev: any) => ({
        ...prev,
        [id]: newValue
      }));
    } catch {
      try {
        onChange({ [id]: newValue });
      } catch {
        // Fallback for other patterns
        onChange(newValue);
      }
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validate(value));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    generateText(input);
  };

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
        const context = canvas.getContext('2d');
        if (context && videoRef.current) {
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        }
    }
  };

  return (
    <div className="form-group">
      <label className="ui-label" htmlFor={id}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        id={id}
        type={type}
        className={'ui-input ' + (touched && error ? 'error' : '')}
        value={value || ''}
        onChange={(e) => {
          handleChange(e);
          handleInputChange(e);
        }}
        onBlur={handleBlur}
        required={required}
        pattern={pattern}
        min={min}
        max={max}
      />
      {touched && error && (
        <div className="error-message">{error}</div>
      )}
      <p>{generatedText}</p>
      <video ref={videoRef} width="640" height="480" />
      <button onClick={captureImage}>Capture</button>
      <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
      <button onClick={startCamera}>Start Camera</button>
    </div>
  );
}