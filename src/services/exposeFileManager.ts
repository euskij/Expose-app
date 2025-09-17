import { useLocalStorage } from '../hooks/useLocalStorage';

export interface ExposeSaveData {
  id: string;
  fileName: string;
  address: string;
  userMerkmal: string;
  createdAt: string;
  updatedAt: string;
  data: any; // ImmobilienData
  photos: string[];
}

export interface ExposeListItem {
  id: string;
  fileName: string;
  address: string;
  userMerkmal: string;
  createdAt: string;
  updatedAt: string;
}

export class ExposeFileManager {
  private static STORAGE_KEY = 'exposeSaveFiles';
  
  // Generiere einen eindeutigen Dateinamen aus Adresse + Merkmal
  static generateFileName(address: string, userMerkmal: string): string {
    const cleanAddress = address.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const cleanMerkmal = userMerkmal.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    return `${cleanAddress}_${cleanMerkmal}`.toLowerCase();
  }

  // Generiere eine eindeutige ID
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Lade alle gespeicherten Exposés
  static loadExposeList(): ExposeListItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const allExposes: ExposeSaveData[] = JSON.parse(stored);
      return allExposes.map(expose => ({
        id: expose.id,
        fileName: expose.fileName,
        address: expose.address,
        userMerkmal: expose.userMerkmal,
        createdAt: expose.createdAt,
        updatedAt: expose.updatedAt
      }));
    } catch (error) {
      console.error('Fehler beim Laden der Exposé-Liste:', error);
      return [];
    }
  }

  // Lade ein spezifisches Exposé
  static loadExpose(id: string): ExposeSaveData | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const allExposes: ExposeSaveData[] = JSON.parse(stored);
      return allExposes.find(expose => expose.id === id) || null;
    } catch (error) {
      console.error('Fehler beim Laden des Exposés:', error);
      return null;
    }
  }

  // Speichere ein Exposé
  static saveExpose(
    id: string | null,
    address: string,
    userMerkmal: string,
    data: any,
    photos: string[]
  ): string {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const allExposes: ExposeSaveData[] = stored ? JSON.parse(stored) : [];
      
      const fileName = this.generateFileName(address, userMerkmal);
      const now = new Date().toISOString();
      
      const exposeData: ExposeSaveData = {
        id: id || this.generateId(),
        fileName,
        address,
        userMerkmal,
        createdAt: id ? 
          (allExposes.find(e => e.id === id)?.createdAt || now) : 
          now,
        updatedAt: now,
        data,
        photos
      };

      // Entferne existierendes Exposé mit derselben ID (Update)
      const filteredExposes = allExposes.filter(expose => expose.id !== exposeData.id);
      filteredExposes.push(exposeData);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredExposes));
      return exposeData.id;
    } catch (error) {
      console.error('Fehler beim Speichern des Exposés:', error);
      throw new Error('Exposé konnte nicht gespeichert werden');
    }
  }

  // Lösche ein Exposé
  static deleteExpose(id: string): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return false;
      
      const allExposes: ExposeSaveData[] = JSON.parse(stored);
      const filteredExposes = allExposes.filter(expose => expose.id !== id);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredExposes));
      return true;
    } catch (error) {
      console.error('Fehler beim Löschen des Exposés:', error);
      return false;
    }
  }

  // Kopiere ein Exposé
  static copyExpose(id: string, newUserMerkmal: string): string | null {
    try {
      const originalExpose = this.loadExpose(id);
      if (!originalExpose) return null;
      
      return this.saveExpose(
        null, // Neue ID generieren
        originalExpose.address,
        newUserMerkmal,
        originalExpose.data,
        originalExpose.photos
      );
    } catch (error) {
      console.error('Fehler beim Kopieren des Exposés:', error);
      return null;
    }
  }

  // Prüfe ob ein Dateiname bereits existiert
  static fileNameExists(fileName: string, excludeId?: string): boolean {
    const allExposes = this.loadExposeList();
    return allExposes.some(expose => 
      expose.fileName === fileName && expose.id !== excludeId
    );
  }
}