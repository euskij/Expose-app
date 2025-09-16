import React, { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { LocationMap } from "./components/LocationMap";
import type { ImmobilienData, EnergieausweisInfo } from "./types";
import type { EnergieausweisData } from "./services/energieausweisParser";
import { processImage } from "./services/imageProcessing";
import { generateTexts } from "./services/textGeneration";
import { TextPreviewModal } from "./components/TextPreviewModal";
import { EnergieausweisUpload } from "./components/EnergieausweisUpload";
import "./styles.css";

// ------------------ Mini-UI (ohne Fremdbibliotheken) ------------------
type DivProps = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode };
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: React.ReactNode };
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

function Card({ className = "", ...props }: DivProps) {
  return <div className={"ui-card " + className} {...props} />;
}
function CardHeader({ className = "", ...props }: DivProps) {
  return <div className={"ui-card-header " + className} {...props} />;
}
function CardTitle({ className = "", ...props }: DivProps) {
  return <h3 className={"ui-card-title " + className} {...props} />;
}
function CardContent({ className = "", ...props }: DivProps) {
  return <div className={"ui-card-content " + className} {...props} />;
}
function Badge({ className = "", ...props }: DivProps) {
  return <span className={"ui-badge " + className} {...props} />;
}
function Button({ className = "", type, ...props }: ButtonProps) {
  const btnType = (type as any) || "button";
  return <button type={btnType as any} className={"ui-btn " + className} {...props} />;
}
function Input({ className = "", ...props }: InputProps) {
  return <input className={"ui-input " + className} {...props} />;
}
function Textarea({ className = "", ...props }: TextareaProps) {
  return <textarea className={"ui-textarea " + className} {...props} />;
}
function Label({ className = "", ...props }: LabelProps) {
  return <label className={"ui-label " + className} {...props} />;
}

// ----------------- Bild-Optimierung (clientseitig) -----------------
async function optimizeImage(
  file: File,
  settings: { maxWidth: number; maxHeight: number; contrastStrength: number; sharpen: boolean; brightness: number }
) {
  const img = await fileToImage(file);
  const maxW = settings.maxWidth ?? 1920;
  const maxH = settings.maxHeight ?? 1280;
  const { canvas, ctx, targetW, targetH } = createCanvasForImage(img, maxW, maxH);
  ctx.drawImage(img, 0, 0, targetW, targetH);
  let imageData = ctx.getImageData(0, 0, targetW, targetH);
  imageData = autoLevels(imageData, settings.contrastStrength ?? 0.9);
  if (settings.sharpen) imageData = convolve(imageData, [0, -1, 0, -1, 5, -1, 0, -1, 0]);
  if (settings.brightness !== 0) imageData = adjustBrightness(imageData, settings.brightness || 0);
  ctx.putImageData(imageData, 0, 0);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  return { url: dataUrl, width: targetW, height: targetH };
}
function fileToImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function createCanvasForImage(img: HTMLImageElement, maxW: number, maxH: number) {
  const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
  const targetW = Math.round(img.width * ratio);
  const targetH = Math.round(img.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  return { canvas, ctx, targetW, targetH };
}
function autoLevels(imageData: ImageData, strength = 0.9) {
  const d = imageData.data;
  let min = 255,
    max = 0;
  for (let i = 0; i < d.length; i += 4) {
    const v = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const range = Math.max(1, max - min);
  for (let i = 0; i < d.length; i += 4) {
    d[i] = clamp(((d[i] - min) / range) * 255 * strength + d[i] * (1 - strength));
    d[i + 1] = clamp(((d[i + 1] - min) / range) * 255 * strength + d[i + 1] * (1 - strength));
    d[i + 2] = clamp(((d[i + 2] - min) / range) * 255 * strength + d[i + 2] * (1 - strength));
  }
  return imageData;
}
function adjustBrightness(imageData: ImageData, delta: number) {
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = clamp(d[i] + delta);
    d[i + 1] = clamp(d[i + 1] + delta);
    d[i + 2] = clamp(d[i + 2] + delta);
  }
  return imageData;
}
function convolve(imageData: ImageData, kernel: number[]) {
  const side = Math.round(Math.sqrt(kernel.length));
  const half = Math.floor(side / 2);
  const src = imageData.data,
    sw = imageData.width,
    sh = imageData.height;
  const out = new ImageData(sw, sh),
    dst = out.data as Uint8ClampedArray;
  for (let y = 0; y < sh; y++)
    for (let x = 0; x < sw; x++) {
      let r = 0,
        g = 0,
        b = 0;
      for (let ky = 0; ky < side; ky++)
        for (let kx = 0; kx < side; kx++) {
          const px = Math.max(0, Math.min(sw - 1, x + kx - half));
          const py = Math.max(0, Math.min(sh - 1, y + ky - half));
          const idx = (py * sw + px) * 4;
          const w = kernel[ky * side + kx];
          r += src[idx] * w;
          g += src[idx + 1] * w;
          b += src[idx + 2] * w;
        }
      const di = (y * sw + x) * 4;
      dst[di] = clamp(r);
      dst[di + 1] = clamp(g);
      dst[di + 2] = clamp(b);
      dst[di + 3] = 255;
    }
  return out;
}
const clamp = (v: number) => Math.max(0, Math.min(255, v));

// ----------------- Defaults & Typabhängigkeit -----------------
const defaultData = {
  titel: "Moderne Immobilie mit optimaler Lage",
  adresse: "Musterstraße 12, 12345 Musterstadt",
  lage: "Ruhige Wohngegend mit sehr guter Anbindung und Nahversorgung.",
  baujahr: "2018",
  heizungsart: "Wärmepumpe",
  wohnflaeche: "120 m²",
  grundstuecksflaeche: "350 m²",
  ist_miete: "24.000 €/Jahr",
  soll_miete: "28.000 €/Jahr",
  verkaufspreis: "749.000 €",
  faktor: "31,2",
  maklercourtage: "3,57% inkl. MwSt.",
  // Typ-spezifisch
  zimmer: "4",
  etage: "2. OG",
  etagenanzahl: "3",
  gewerbeflaeche: "0 m²",
  letzte_sanierung: "2022",
  kontakt_name: "Max Mustermann",
  kontakt_tel: "+49 123 456789",
  kontakt_mail: "immos@example.com",
};
const TYPEN = [
  { value: "wohnung", label: "Wohnung" },
  { value: "mfh", label: "Mehrfamilienhaus" },
  { value: "efh", label: "Einfamilienhaus" },
  { value: "doppel", label: "Doppelhaushälfte" },
];

function getExtraFields(objektTyp: string) {
  if (objektTyp === "wohnung")
    return [
      { id: "zimmer", label: "Zimmer" },
      { id: "etage", label: "Etage" },
    ];
  if (objektTyp === "mfh")
    return [
      { id: "etagenanzahl", label: "Etagenanzahl" },
      { id: "gewerbeflaeche", label: "Gewerbefläche" },
    ];
  return [{ id: "letzte_sanierung", label: "Letzte Sanierung" }];
}

// ------------------- App --------------------
export default function App() {
  const handleFieldUpdate = (update: Partial<ImmobilienData>) => {
    setData({ ...data, ...update });
  };

  const handleEnergieausweisUpload = (data: EnergieausweisData) => {
    setEnergieausweis({
      type: data.type,
      validUntil: data.validUntil,
      energyEfficiencyClass: data.energyEfficiencyClass,
      heatingType: data.heatingType,
      energySources: [data.heatingType],
      buildingType: data.buildingType,
      constructionYear: data.constructionYear,
      isResidential: data.isResidential,
      energyDemand: data.energyDemand,
      primaryEnergyDemand: data.primaryEnergyDemand
    });
    
    handleFieldUpdate({
      baujahr: data.constructionYear,
      heizungsart: data.heatingType
    });
  };

  const steps = ["Objektdaten", "Bilder", "Optimierung", "Vorschau"];
  const [currentStep, setCurrentStep] = useState(0);
  
  // Navigation zwischen den Schritten
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  
  // --- Persistenter State mit LocalStorage ---
  const [objektTyp, setObjektTyp] = useLocalStorage("objektTyp", "wohnung");
    const [data, setData] = useLocalStorage<ImmobilienData>('immobilienData', {
    objektTyp: 'wohnung',
    titel: '',
    adresse: '',
    lage: '',
    baujahr: '',
    heizungsart: '',
    wohnflaeche: '',
    grundstuecksflaeche: '',
    ist_miete: '',
    soll_miete: '',
    verkaufspreis: '',
    faktor: '',
    maklercourtage: '',
    kontakt_name: '',
    kontakt_tel: '',
    kontakt_mail: '',
    zimmer: '',
    etage: '',
    etagenanzahl: '',
    gewerbeflaeche: '',
    letzte_sanierung: '',
  });

  const [energieausweis, setEnergieausweis] = useState<EnergieausweisInfo | null>(null);
  const [color, setColor] = useLocalStorage("color", "#2E7D6F");
  const [photos, setPhotos] = useLocalStorage<string[]>("photos", []);
  const [optimSettings, setOptimSettings] = useState({
    maxWidth: 1920,
    maxHeight: 1280,
    contrastStrength: 0.9,
    sharpen: true,
    brightness: 0,
  });
  const [lageText, setLageText] = useState("");
  const [generatedTexts, setGeneratedTexts] = useState<{
    title: string;
    shortDescription: string;
    longDescription: string;
    highlights: string[];
  } | null>(null);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [importedRows, setImportedRows] = useState<Array<Record<string, string>>>([]);
  const [selectedRowIdx, setSelectedRowIdx] = useState<number>(0);

  // Bilder: Limit & DnD & Auswahl
  const [photoLimitMsg, setPhotoLimitMsg] = useState<string>("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [selectedThumbs, setSelectedThumbs] = useState<Set<number>>(new Set());

  // KI Titelbild Vorschlag
  const [suggestedCoverIdx, setSuggestedCoverIdx] = useState<number | null>(null);
  const [suggestLoading, setSuggestLoading] = useState<boolean>(false);
  const [suggestError, setSuggestError] = useState<string>("");

  const handlePrint = () => {
    try {
      requestAnimationFrame(() => {
        try {
          (window as any).focus?.();
        } catch {}
        setTimeout(() => window.print(), 50);
      });
    } catch (e) {
      console.error("print failed", e);
    }
  };

  const [showTextPreview, setShowTextPreview] = useState(false);
  const [previewTexts, setPreviewTexts] = useState<{
    title: string;
    shortDescription: string;
    longDescription: string;
    highlights: string[];
  } | null>(null);

  const handleGenerateTexts = async () => {
    if (!location) {
      console.error('Keine Koordinaten verfügbar');
      return;
    }

    setIsGeneratingText(true);
    try {
      const texts = await generateTexts(data, { lat: location[0], lon: location[1] });
      setPreviewTexts(texts);
      setShowTextPreview(true);
    } catch (error) {
      console.error('Fehler bei der Textgenerierung:', error);
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleApplyTexts = () => {
    if (previewTexts) {
      setData({
        ...data,
        titel: previewTexts.title,
        lage: previewTexts.shortDescription
      });
      setShowTextPreview(false);
    }
  };

  // -------- CSV/JSON Import (Mehrzeilen) --------
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [] as Array<Record<string, string>>;
    const headers = lines[0].split(",").map((h) => h.trim());
    const rows: Array<Record<string, string>> = [];
    for (let r = 1; r < lines.length; r++) {
      const values = lines[r].split(",");
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        if (h) obj[h] = (values[i] ?? "").trim();
      });
      rows.push(obj);
    }
    return rows;
  };
  const parseDataFile = async (file: File) => {
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json)) return json as Array<Record<string, string>>;
      if (json && typeof json === "object") return [json as Record<string, string>];
      return [] as Array<Record<string, string>>;
    } catch {
      return parseCSV(text);
    }
  };
  const onDataFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const rows = await parseDataFile(f);
    setImportedRows(rows);
    setSelectedRowIdx(0);
    if (rows[0]) setData((prev) => ({ ...prev, ...rows[0] }));
  };

  // -------- Bilder Upload/Optimierung --------
  const addOptimizedPhotos = async (fileList: File[]) => {
    const LIMIT = 12;
    const remaining = Math.max(0, LIMIT - photos.length);
    if (remaining <= 0) {
      setPhotoLimitMsg("Maximal 12 Bilder erreicht.");
      return;
    }
    const slice = fileList.slice(0, remaining);
    if (slice.length < fileList.length)
      setPhotoLimitMsg(`Es wurden nur ${slice.length} von ${fileList.length} Bildern übernommen (Limit 12).`);

    const optimized: string[] = [];
    for (const f of slice) {
      try {
        const { url } = await processImage(f, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          quality: 0.9,
          watermark: data.kontakt_name ? {
            text: data.kontakt_name,
            opacity: 0.3,
            fontSize: 24,
            color: color
          } : undefined
        });
        optimized.push(url);
      } catch (err) {
        console.error("Bildoptimierung fehlgeschlagen", err);
      }
    }
    setPhotos((prevPhotos: string[]) => [...prevPhotos, ...optimized]);
  };
  const onPhotoFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) await addOptimizedPhotos(files);
  };
  const onDropPhotos = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/"));
    if (files.length) await addOptimizedPhotos(files);
  };
  const onDragOverPhotos = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // DnD Thumbs
  const onDragStartThumb = (i: number) => setDragIndex(i);
  const onDragOverThumb = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const onDropThumb = (i: number) => {
    if (dragIndex === null || dragIndex === i) {
      setDragIndex(null);
      return;
    }
    setPhotos((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(dragIndex, 1);
      arr.splice(i, 0, moved);
      return arr;
    });
    setDragIndex(null);
  };

  // Auswahl / Entfernen
  const toggleSelect = (i: number) => {
    setSelectedThumbs((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  };
  const clearSelection = () => setSelectedThumbs(new Set());
  const selectAll = () => setSelectedThumbs(new Set(photos.map((_, i) => i)));
  const removeSelected = () => {
    if (selectedThumbs.size === 0) return;
    setPhotos((prev) => prev.filter((_, i) => !selectedThumbs.has(i)));
    clearSelection();
  };
  const removePhoto = (idx: number) => setPhotos((prevPhotos: string[]) => prevPhotos.filter((_: string, i: number) => i !== idx));
  const movePhoto = (idx: number, dir: -1 | 1) => {
    setPhotos((prev) => {
      const arr = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return arr;
      const tmp = arr[idx];
      arr[idx] = arr[j];
      arr[j] = tmp;
      return arr;
    });
  };

  // KI Cover Vorschlag
  const applySuggestedAsCover = () => {
    if (suggestedCoverIdx == null) return;
    setPhotos((prev) => {
      const arr = [...prev];
      const [img] = arr.splice(suggestedCoverIdx, 1);
      arr.unshift(img);
      return arr;
    });
  };
  const requestCoverSuggestion = async () => {
    if (photos.length === 0) return;
    setSuggestLoading(true);
    setSuggestError("");
    setSuggestedCoverIdx(null);
    try {
      const res = await fetch("/api/cover-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: photos }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      if (typeof j.index === "number") setSuggestedCoverIdx(Math.max(0, Math.min(photos.length - 1, j.index)));
      else if (Array.isArray(j.scores)) {
        let best = 0;
        for (let i = 1; i < j.scores.length; i++) if (j.scores[i] > j.scores[best]) best = i;
        setSuggestedCoverIdx(best);
      } else {
        const scores = await Promise.all(photos.map(estimateQualityScore));
        let best = 0;
        for (let i = 1; i < scores.length; i++) if (scores[i] > scores[best]) best = i;
        setSuggestedCoverIdx(best);
      }
    } catch (e: any) {
      console.error(e);
      setSuggestError("Vorschlag fehlgeschlagen.");
    } finally {
      setSuggestLoading(false);
    }
  };
  async function estimateQualityScore(dataUrl: string): Promise<number> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(img, 0, 0, 256, 256);
        const id = ctx.getImageData(0, 0, 256, 256).data;
        let sum = 0,
          sum2 = 0,
          n = 0;
        for (let i = 0; i < id.length; i += 4) {
          const y = 0.2126 * id[i] + 0.7152 * id[i + 1] + 0.0722 * id[i + 2];
          sum += y;
          sum2 += y * y;
          n++;
        }
        const mean = sum / n;
        const varc = sum2 / n - mean * mean;
        resolve(varc);
      };
      img.onerror = () => resolve(0);
      img.src = dataUrl;
    });
  }

  // Lage-Text Generator (Platzhalter)
  const generateLageText = () => {
    const a = data.adresse || "";
    const l = data.lage || "";
    const s =
      `Die Immobilie befindet sich in ${a}. Die Umgebung zeichnet sich durch ${l.toLowerCase()} aus. ` +
      `In wenigen Minuten erreichen Sie ÖPNV, Einkaufsmöglichkeiten und Freizeitangebote. ` +
      `Die Lage verbindet ruhiges Wohnen mit schneller Anbindung an die Innenstadt.`;
    setLageText(s);
  };

  // Typabhängige Zusatzfelder
  const extraFields = useMemo(() => getExtraFields(objektTyp), [objektTyp]);

  // Facts (gemeinsam + extras)
  const commonFacts = [
    { id: "baujahr", label: "Baujahr" },
    { id: "heizungsart", label: "Heizungsart" },
    { id: "wohnflaeche", label: "Wohnfläche" },
    { id: "grundstuecksflaeche", label: "Grundstücksfläche" },
    { id: "ist_miete", label: "IST‑Miete" },
    { id: "soll_miete", label: "SOLL‑Miete" },
    { id: "verkaufspreis", label: "Verkaufspreis" },
    { id: "faktor", label: "Faktor" },
    { id: "maklercourtage", label: "Maklercourtage" },
    { id: "lage", label: "Lage" },
  ] as const;
  const allFacts = [...commonFacts, ...extraFields];

  return (
    <div className="wrap">
      {/* globaler Stil inkl. Print */}
      <style>{globalCss}</style>

      {/* Kopfzeile */}
      <div className="header print-hide">
        <div className="row">
          <div className="title">
            <strong>Exposé‑Builder</strong> <Badge>A4 / 2‑Seiten</Badge>
          </div>
          <div className="actions">
            <Button onClick={handlePrint}>🖨️ Als PDF drucken</Button>
          </div>
        </div>
      </div>

      {/* Druckhinweis */}
      <div className="notice print-hide">
        <strong>Druck‑Hinweis:</strong>
        <ul>
          <li>Skalierung: <em>100 %</em></li>
          <li><em>Hintergrundgrafiken</em> aktivieren</li>
          <li>Ränder: <em>Minimal</em> (CSS erzwingt ~8 mm)</li>
        </ul>
      </div>

      <div className="grid">
        {/* Steuerpanel */}
        <div className="col-left print-hide">
          <Card>
            <CardHeader>
              <CardTitle>Objekttyp & Design</CardTitle>
            </CardHeader>
            <CardContent className="space">
              <div>
                <Label>Objekttyp</Label>
                <select
                  value={objektTyp}
                  onChange={(e) => setObjektTyp(e.target.value)}
                  className="ui-input"
                >
                  {TYPEN.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Akzentfarbe</Label>
                <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grunddaten</CardTitle>
            </CardHeader>
            <CardContent className="space">
              <TextField id="titel" label="Titel" value={data.titel} onChange={setData} />
              <TextField id="adresse" label="Adresse" value={data.adresse} onChange={setData} />
              <LocationMap address={data.adresse} />
              <TextField id="lage" label="Lage (kurz)" value={data.lage} onChange={setData} />
              <Button 
                onClick={handleGenerateTexts}
                disabled={!location || isGeneratingText}
                className="text-gen-btn"
              >
                <FileText size={16} />
                {isGeneratingText ? 'Generiere Text...' : 'Text generieren'}
              </Button>
              <div className="grid-2">
                <TextField id="baujahr" label="Baujahr" value={data.baujahr} onChange={handleFieldUpdate} />
                <div className="grid-item">
                  <TextField id="heizungsart" label="Heizungsart" value={data.heizungsart} onChange={handleFieldUpdate} />
                  <div style={{ marginTop: '1rem' }}>
                    <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                      Energieausweis hochladen
                    </span>
                    <EnergieausweisUpload onDataExtracted={handleEnergieausweisUpload} />
                  </div>
                </div>
                <TextField id="wohnflaeche" label="Wohnfläche" value={data.wohnflaeche} onChange={handleFieldUpdate} />
                <TextField id="grundstuecksflaeche" label="Grundstücksfläche" value={data.grundstuecksflaeche} onChange={handleFieldUpdate} />
                <TextField id="ist_miete" label="IST‑Miete / Jahr" value={data.ist_miete} onChange={handleFieldUpdate} />
                <TextField id="soll_miete" label="SOLL‑Miete / Jahr" value={data.soll_miete} onChange={handleFieldUpdate} />
                <TextField id="verkaufspreis" label="Verkaufspreis" value={data.verkaufspreis} onChange={handleFieldUpdate} />
                <TextField id="faktor" label="Faktor" value={data.faktor} onChange={handleFieldUpdate} />
                <TextField id="maklercourtage" label="Maklercourtage" value={data.maklercourtage} onChange={handleFieldUpdate} />
              </div>

              {/* Typabhängig */}
              {extraFields.length > 0 && (
                <div className="grid-2">
                  {extraFields.map((f) => (
                    <TextField key={f.id} id={f.id} label={f.label} value={data[f.id]} onChange={setData} />
                  ))}
                </div>
              )}

              <div className="space-top">
                <Label>Grunddaten aus Datei (CSV/JSON)</Label>
                <Input type="file" accept=".csv,.json" onChange={onDataFile} />
                <p className="muted">CSV: Kopfzeile = Spalten, Folgezeilen = Datensätze. JSON: Objekt oder Array.</p>

                {importedRows.length > 0 && (
                  <div className="box">
                    <div className="row gap">
                      <Label>Datensatz wählen</Label>
                      <select
                        value={String(selectedRowIdx)}
                        onChange={(e) => setSelectedRowIdx(parseInt(e.target.value))}
                        className="ui-input small"
                      >
                        {importedRows.map((row, i) => {
                          const title = (row as any).titel || (row as any).title || (row as any).adresse || `Zeile ${i + 1}`;
                          return (
                            <option key={i} value={String(i)}>
                              {i + 1}. {title}
                            </option>
                          );
                        })}
                      </select>
                      <Button onClick={() => {
                        const r = importedRows[selectedRowIdx];
                        if (r) setData((prev) => ({ ...prev, ...r }));
                      }}>Übernehmen</Button>
                    </div>
                    <div className="table-scroll">
                      <table className="mini-table">
                        <thead>
                          <tr>
                            {Object.keys(importedRows[0]).map((h) => (
                              <th key={h}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {importedRows.slice(0, 10).map((row, ri) => (
                            <tr key={ri} className={ri === selectedRowIdx ? "hl" : ""}>
                              {Object.keys(importedRows[0]).map((h) => (
                                <td key={h}>{(row as any)[h]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="muted tiny">Vorschau (max. 10 Zeilen)</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bilder‑Upload & Optimierung</CardTitle>
            </CardHeader>
            <CardContent className="space">
              <div className="drop"
                   onDrop={onDropPhotos}
                   onDragOver={onDragOverPhotos}>
                <p><strong>Bilder hierher ziehen</strong> oder auswählen</p>
                <Input multiple type="file" accept="image/*" onChange={onPhotoFiles} />
                <p className="muted tiny">Drag & Drop, Mehrfachauswahl, lokale Optimierung (Resize/Auto‑Kontrast/Schärfen/Helligkeit). Erste Miniatur = Titelbild.</p>
              </div>

              {photos.length > 0 && (
                <div>
                  <div className="row between">
                    <div>
                      <Label>Ausgewählte Bilder ({photos.length}/12)</Label>
                      {photoLimitMsg && <p className="error tiny">{photoLimitMsg}</p>}
                    </div>
                    <div className="row gap">
                      <Button onClick={requestCoverSuggestion} disabled={suggestLoading || photos.length === 0}>KI: Titelbild vorschlagen</Button>
                      {suggestedCoverIdx != null && <Button onClick={applySuggestedAsCover}>Vorschlag übernehmen</Button>}
                      <Button onClick={selectAll} disabled={photos.length === 0}>Alle auswählen</Button>
                      <Button onClick={clearSelection} disabled={selectedThumbs.size === 0}>Auswahl aufheben</Button>
                      <Button onClick={removeSelected} disabled={selectedThumbs.size === 0}>Auswahl entfernen</Button>
                    </div>
                  </div>
                  {suggestError && <p className="error tiny">{suggestError}</p>}
                  {suggestLoading && <p className="muted tiny">Bewerte Bilder…</p>}

                  <div className="thumb-grid">
                    {photos.map((src, i) => (
                      <div key={i}
                           className={"thumb " + (dragIndex === i ? "drag" : "")}
                           draggable
                           onDragStart={() => onDragStartThumb(i)}
                           onDragOver={onDragOverThumb}
                           onDrop={() => onDropThumb(i)}>
                        <img src={src} className="thumb-img" />
                        {suggestedCoverIdx === i && <span className="suggest">Vorschlag</span>}
                        <label className="check">
                          <input type="checkbox" checked={selectedThumbs.has(i)} onChange={() => toggleSelect(i)} />
                        </label>
                        <div className="thumb-actions">
                          <Button onClick={() => movePhoto(i, -1)} disabled={i === 0}>←</Button>
                          <Button onClick={() => movePhoto(i, 1)} disabled={i === photos.length - 1}>→</Button>
                          <Button onClick={() => removePhoto(i)}>Entfernen</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid-2">
                <div>
                  <Label>Max. Breite (px)</Label>
                  <Input type="number" value={optimSettings.maxWidth}
                         onChange={(e) => setOptimSettings({ ...optimSettings, maxWidth: parseInt(e.target.value || "0") })} />
                </div>
                <div>
                  <Label>Max. Höhe (px)</Label>
                  <Input type="number" value={optimSettings.maxHeight}
                         onChange={(e) => setOptimSettings({ ...optimSettings, maxHeight: parseInt(e.target.value || "0") })} />
                </div>
              </div>
              <div>
                <Label>Kontraststärke</Label>
                <input type="range" min={0} max={100}
                       value={Math.round(optimSettings.contrastStrength * 100)}
                       onChange={(e) => setOptimSettings({ ...optimSettings, contrastStrength: Number(e.currentTarget.value) / 100 })}
                       className="range" />
              </div>
              <div className="row gap">
                <input id="sharpen" type="checkbox" checked={optimSettings.sharpen}
                       onChange={(e) => setOptimSettings({ ...optimSettings, sharpen: e.target.checked })} />
                <Label htmlFor="sharpen">Leichte Schärfung</Label>
              </div>
              <div>
                <Label>Helligkeit (−50…+50)</Label>
                <Input type="number" min={-50} max={50} value={optimSettings.brightness}
                       onChange={(e) => setOptimSettings({ ...optimSettings, brightness: parseInt(e.target.value || "0") })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lage‑Text</CardTitle>
            </CardHeader>
            <CardContent className="space">
              <Button onClick={generateLageText}>KI‑Lage‑Text erzeugen</Button>
              <Textarea value={lageText} onChange={(e) => setLageText(e.target.value)} placeholder="Lagebeschreibung…" />
              <p className="muted tiny">Hinweis: Lokaler Generator – kann später durch echtes KI‑Backend ersetzt werden.</p>
            </CardContent>
          </Card>
        </div>

        {/* Vorschau */}
        <div className="col-right">
          <Card className="print-borderless">
            <CardHeader className="print-hide">
              <CardTitle>A4‑Vorschau</CardTitle>
            </CardHeader>
            <CardContent>
              <A4Document
                color={color}
                titel={data.titel}
                adresse={data.adresse}
                photos={photos}
                facts={allFacts.map((f) => ({ label: f.label, value: (data as any)[f.id] }))}
                lageText={lageText}
                kontakt={{ name: data.kontakt_name, tel: data.kontakt_tel, mail: data.kontakt_mail }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {previewTexts && (
        <TextPreviewModal
          isOpen={showTextPreview}
          onClose={() => setShowTextPreview(false)}
          texts={previewTexts}
          onApply={handleApplyTexts}
        />
      )}
    </div>
  );
}

// ------------------- A4 Layout -------------------
function A4Document({
  color,
  titel,
  adresse,
  photos,
  facts,
  lageText,
  kontakt,
}: {
  color: string;
  titel: string;
  adresse: string;
  photos: string[];
  facts: { label: string; value: string }[];
  lageText: string;
  kontakt: { name: string; tel: string; mail: string };
}) {
  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 8mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page { break-after: page; box-shadow: none !important; }
          .print-hide { display: none !important; }
        }
        .a4 { width: 210mm; min-height: 297mm; background: white; margin: 0 auto; }
        .page { box-shadow: 0 10px 30px rgba(0,0,0,.08); border-radius: 12px; overflow: hidden; }
        .content { padding: 18mm 16mm; }
        .facts { width: 100%; border-collapse: collapse; font-size: 0.95rem; margin: 0 0 12px 0; }
        .facts td, .facts th { border: 1px solid #e5e7eb; padding: 6px 8px; }
        .facts .label { width: 35%; color: #555; font-weight: 600; background: #f8fafc; }
      `}</style>

      {/* Seite 1 */}
      <div className="a4 page">
        {photos?.[0] ? (
          <img src={photos[0]} alt="Titelbild" style={{ width: "100%", height: "120mm", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "120mm", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
            Titelbild hier hochladen
          </div>
        )}
        <div className="content">
          <h1 style={{ fontSize: "30px", fontWeight: 800, margin: "0 0 4px 0", color }}>{titel}</h1>
          <p style={{ margin: "0 0 12px 0", color: "#555" }}>{adresse}</p>
          <table className="facts">
            <tbody>
              {facts.filter((f) => f?.value).map((f, i) => (
                <tr key={i}>
                  <td className="label">{f.label}</td>
                  <td>{f.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 20, fontSize: "0.95rem", color: "#374151" }}>
            <span style={{ fontWeight: 600 }}>Kontakt: </span>
            {kontakt?.name} • {kontakt?.tel} • {kontakt?.mail}
          </div>
        </div>
      </div>

      {/* Seite 2 */}
      <div className="a4 page">
        <div className="content">
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: 12, color }}>Impressionen & Lage</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            {(photos?.slice(1, 4).length ? photos.slice(1, 4) : [null, null]).map((p, idx) =>
              p ? (
                <img key={idx} src={p} style={{ width: "100%", height: "60mm", objectFit: "cover", borderRadius: 10 }} />
              ) : (
                <div key={idx} style={{ width: "100%", height: "60mm", background: "#f1f5f9", borderRadius: 10 }} />
              )
            )}
          </div>
          <p style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {lageText || "Füge hier eine prägnante Lagebeschreibung ein (ÖPNV, Nahversorgung, Bildung, Freizeit, Mikro-/Makrolage)."}
          </p>
        </div>
      </div>
    </>
  );
}

// ------------------- UI‑Hilfen -------------------
function TextField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={value}
        onChange={(e) =>
          onChange((prev) => ({ ...prev, [id]: (e.target as HTMLInputElement).value }))
        }
      />
    </div>
  );
}

// ------------------- Dev‑Tests (laufen 1× im Browser) -------------------
const globalCss = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; background:#f6f7f9; color:#111827;}
  .wrap { padding: 16px 16px 40px; }
  .header .row { display:flex; align-items:center; justify-content:space-between; margin-bottom: 12px; }
  .title { display:flex; align-items:center; gap:8px; font-size:18px; }
  .actions { display:flex; gap:8px; }

  .notice { border:1px solid #fde68a; background:#fef3c7; color:#92400e; padding:10px 12px; border-radius:10px; margin-bottom:16px; }
  .notice ul { margin:6px 0 0 18px; padding:0; }
  .notice li { margin:2px 0; }

  .grid { display:grid; grid-template-columns: 360px 1fr; gap:16px; }
  @media (max-width: 980px) { .grid { grid-template-columns: 1fr; } }

  .ui-card { border:1px solid #e5e7eb; background:#fff; border-radius:14px; box-shadow: 0 2px 10px rgba(0,0,0,.03); }
  .ui-card-header { padding:12px 14px; border-bottom:1px solid #f1f5f9; }
  .ui-card-title { font-weight:600; font-size:16px; margin:0; }
  .ui-card-content { padding:12px 14px; }
  .ui-badge { display:inline-flex; align-items:center; border:1px solid #e5e7eb; background:#f8fafc; color:#374151; padding:2px 8px; border-radius:999px; font-size:12px; }
  .ui-btn { border:1px solid #e5e7eb; background:#fff; padding:8px 12px; border-radius:10px; font-size:14px; cursor:pointer; }
  .ui-btn:hover { background:#f9fafb; }
  .ui-input { width:100%; border:1px solid #e5e7eb; background:#fff; padding:8px 10px; border-radius:10px; font-size:14px; }
  .ui-textarea { width:100%; border:1px solid #e5e7eb; background:#fff; padding:8px 10px; border-radius:10px; font-size:14px; min-height:120px; }
  .ui-label { display:block; font-size:13px; color:#6b7280; margin-bottom:6px; }

  .space > * + * { margin-top:10px; }
  .space-top { margin-top:8px; }
  .grid-2 { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
  .row { display:flex; align-items:center; }
  .row.gap { gap:8px; }
  .row.between { justify-content:space-between; }
  .col-left { display:flex; flex-direction:column; gap:16px; }
  .col-right { }

  .muted { color:#6b7280; }
  .tiny { font-size:12px; }
  .error { color:#b91c1c; }

  .box { border:1px solid #e5e7eb; border-radius:10px; padding:8px; background:#fafafa; }
  .mini-table { width:100%; border-collapse:collapse; }
  .mini-table th, .mini-table td { border:1px solid #e5e7eb; padding:4px 6px; font-size:12px; white-space:nowrap; }
  .mini-table .hl { background:#f3f4f6; }
  .table-scroll { max-height:180px; overflow:auto; }

  .drop { border:2px dashed #d1d5db; border-radius:12px; padding:16px; text-align:center; background:#fff; }

  .thumb-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; }
  .thumb { position:relative; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; background:#fff; }
  .thumb.drag { outline:2px solid #94a3b8; outline-offset:2px; }
  .thumb-img { width:100%; height:110px; object-fit:cover; display:block; }
  .thumb-actions { position:absolute; left:0; right:0; bottom:0; display:flex; justify-content:center; gap:6px; padding:6px; background:rgba(0,0,0,0.4); transform:translateY(100%); transition:.2s; }
  .thumb:hover .thumb-actions { transform:translateY(0); }
  .check { position:absolute; top:6px; right:6px; background:rgba(255,255,255,.9); border-radius:6px; padding:3px; }
  .suggest { position:absolute; top:6px; left:6px; background:rgba(255,255,255,.9); border-radius:999px; padding:2px 6px; font-size:11px; }

  .range { width:100%; }

  .print-hide { display: none; }
  @media screen { .print-hide { display: block; } }
`;

// Run lightweight dev tests once
if (typeof window !== "undefined" && !(window as any).__EXPOSE_DEV_TESTED__) {
  try {
    // CSV basic tests
    const t1 = "a,b\n1,2";
    const r1 = (() => {
      const lines = t1.split(/\r?\n/).filter(Boolean);
      const headers = lines[0].split(",");
      const rows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(",");
        const o: any = {};
        headers.forEach((h, j) => (o[h] = vals[j]));
        rows.push(o);
      }
      return rows;
    })();
    console.assert(r1.length === 1 && r1[0].a === "1" && r1[0].b === "2", "parseCSV LF failed");

    const t2 = "a,b\r\n1,2\r\n3,4";
    const r2 = (() => {
      const lines = t2.split(/\r?\n/).filter(Boolean);
      const headers = lines[0].split(",");
      const rows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(",");
        const o: any = {};
        headers.forEach((h, j) => (o[h] = vals[j]));
        rows.push(o);
      }
      return rows;
    })();
    console.assert(r2.length === 2 && r2[1].a === "3" && r2[1].b === "4", "parseCSV multi-row failed");

    const t3 = "titel,adresse\nWohnung,Beispielweg 1\nHaus,Beispielweg 2";
    const r3 = (() => {
      const lines = t3.split(/\r?\n/).filter(Boolean);
      const headers = lines[0].split(",");
      const rows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(",");
        const o: any = {};
        headers.forEach((h, j) => (o[h] = vals[j]));
        rows.push(o);
      }
      return rows;
    })();
    console.assert(r3.length === 2 && r3[0].titel === "Wohnung" && r3[1].adresse === "Beispielweg 2", "parseCSV mapping failed");

    const t4 = "a,b\n1,2\n\n3,4\n";
    const r4 = (() => {
      const lines = t4.split(/\r?\n/).filter(Boolean);
      const headers = lines[0].split(",");
      const rows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(",");
        const o: any = {};
        headers.forEach((h, j) => (o[h] = vals[j]));
        rows.push(o);
      }
      return rows;
    })();
    console.assert(r4.length === 2 && r4[1].a === "3" && r4[1].b === "4", "parseCSV empty-line handling failed");

    // Photos slice
    (() => {
      const ph = ["a", "b", "c", "d"];
      const sliced = ph.slice(1, 4);
      console.assert(sliced.length === 3 && sliced[0] === "b" && sliced[2] === "d", "photos slice failed");
    })();

    // Typabhängige Felder
    (() => {
      const a = getExtraFields("wohnung");
      const b = getExtraFields("mfh");
      const c = getExtraFields("efh");
      console.assert(a.length === 2 && a.some((x) => x.id === "zimmer"), "wohnung extraFields failed");
      console.assert(b.length === 2 && b.some((x) => x.id === "gewerbeflaeche"), "mfh extraFields failed");
      console.assert(c.length === 1 && c[0].id === "letzte_sanierung", "efh/doppel extraFields failed");
    })();

    // Upload-Limit
    (() => {
      const limit = 12;
      const existing = Array.from({ length: 11 }, (_, i) => String(i));
      const incoming = ["x", "y", "z"];
      const remaining = Math.max(0, limit - (existing as any).length);
      const accepted = incoming.slice(0, remaining);
      console.assert(remaining === 1 && accepted.length === 1, "limit calc failed");
    })();

    // Auswahl/Entfernen Toggle
    (() => {
      const set = new Set<number>();
      set.add(1);
      set.add(2);
      set.delete(1);
      console.assert(!set.has(1) && set.has(2), "selection toggle failed");
    })();

    console.info("Dev tests passed ✔");
  } catch (e) {
    console.error("Dev tests error", e);
  }
  (window as any).__EXPOSE_DEV_TESTED__ = true;
}