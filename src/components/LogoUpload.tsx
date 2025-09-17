import React, { useRef } from 'react';

interface LogoUploadProps {
  logo: string | null;
  setLogo: (logo: string | null) => void;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ logo, setLogo }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogo(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="logo-upload">
      <label>Firmenlogo hochladen:</label>
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        style={{ marginBottom: '8px' }}
      />
      {logo && (
        <div style={{ marginTop: '8px' }}>
          <img src={logo} alt="Firmenlogo" style={{ maxWidth: 120, maxHeight: 60, borderRadius: 4, border: '1px solid #eee' }} />
        </div>
      )}
    </div>
  );
};

export default LogoUpload;
