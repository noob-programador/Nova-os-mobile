/**
 * Safe Storage & Backup Utility for NovaOS
 * Handles localStorage quota management, full system backup/restore,
 * and data compression/validation.
 */

export interface SystemBackupData {
  version: string;
  timestamp: number;
  settings?: any;
  user?: any;
  vfs?: any;
  notes?: any;
  calcHistory?: any;
  photos?: any;
}

export class StorageManager {
  /**
   * Safely set an item in localStorage with quota error catching
   */
  public static setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e: any) {
      console.warn(`[StorageManager] Failed to set "${key}":`, e);
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        this.cleanUpCaches();
        try {
          localStorage.setItem(key, value);
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Safely get an item from localStorage
   */
  public static getItem(key: string, defaultValue: string | null = null): string | null {
    try {
      return localStorage.getItem(key) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Safely remove an item from localStorage
   */
  public static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[StorageManager] Failed to remove "${key}":`, e);
    }
  }

  /**
   * Estimate total storage used by the OS in bytes
   */
  public static getStorageEstimate(): { usedBytes: number; quotaBytes: number; percentage: number } {
    let totalBytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key) || '';
          totalBytes += (key.length + val.length) * 2; // UTF-16 approx 2 bytes per char
        }
      }
    } catch (e) {
      console.warn('[StorageManager] Error reading storage keys', e);
    }

    const quotaBytes = 5 * 1024 * 1024; // Standard 5MB browser localStorage limit
    const percentage = Math.min(100, Math.round((totalBytes / quotaBytes) * 100));

    return {
      usedBytes: totalBytes,
      quotaBytes,
      percentage,
    };
  }

  /**
   * Export full system snapshot as a downloadable JSON string
   */
  public static exportFullSystem(): string {
    const backup: SystemBackupData = {
      version: '3.5.0-nebula',
      timestamp: Date.now(),
      settings: JSON.parse(this.getItem('novaos_settings_v1', '{}') || '{}'),
      user: JSON.parse(this.getItem('novaos_user_profile_v1', '{}') || '{}'),
      vfs: JSON.parse(this.getItem('novaos_virtual_fs_v1', '[]') || '[]'),
      notes: JSON.parse(this.getItem('novaos_notes_v1', '[]') || '[]'),
      calcHistory: JSON.parse(this.getItem('novaos_calc_history_v1', '[]') || '[]'),
      photos: JSON.parse(this.getItem('novaos_gallery_v1', '[]') || '[]'),
    };

    return JSON.stringify(backup, null, 2);
  }

  /**
   * Import system snapshot from JSON string
   */
  public static importFullSystem(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString) as SystemBackupData;
      if (!data.version || !data.timestamp) {
        return { success: false, message: 'Arquivo de backup inválido ou corrompido.' };
      }

      if (data.settings) this.setItem('novaos_settings_v1', JSON.stringify(data.settings));
      if (data.user) this.setItem('novaos_user_profile_v1', JSON.stringify(data.user));
      if (data.vfs) this.setItem('novaos_virtual_fs_v1', JSON.stringify(data.vfs));
      if (data.notes) this.setItem('novaos_notes_v1', JSON.stringify(data.notes));
      if (data.calcHistory) this.setItem('novaos_calc_history_v1', JSON.stringify(data.calcHistory));
      if (data.photos) this.setItem('novaos_gallery_v1', JSON.stringify(data.photos));

      return { success: true, message: 'Backup restaurado com sucesso! Reiniciando sistema...' };
    } catch (e: any) {
      return { success: false, message: `Erro ao importar: ${e.message}` };
    }
  }

  /**
   * Clean up non-critical temporary caches when storage is tight
   */
  public static cleanUpCaches(): void {
    try {
      this.removeItem('novaos_calc_history_v1');
    } catch (e) {
      console.warn('[StorageManager] Cache cleanup failed:', e);
    }
  }
}
