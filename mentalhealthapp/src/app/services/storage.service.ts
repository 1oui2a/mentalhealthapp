// src/app/services/storage.service.ts
import { Injectable } from '@angular/core';
// Change from type-only import to regular import
// biome-ignore lint/style/useImportType: <explanation>
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;
  private initialized = false;

  constructor(private storage: Storage) {
    // We'll initialize later to avoid constructor injection issues
  }

  async init(): Promise<void> {
    // If we already initialized the storage, don't do it again
    if (this.initialized) {
      return;
    }
    
    // Create storage instance
    const storage = await this.storage.create();
    this._storage = storage;
    this.initialized = true;
  }

  // Get data from storage with specific return type
  async get<T>(key: string): Promise<T | null> {
    await this.init();
    return (await this._storage?.get(key)) as T || null;
  }

  // Save data to storage with specific return type
  async set<T>(key: string, value: T): Promise<T> {
    await this.init();
    return await this._storage?.set(key, value) as T;
  }

  // Remove single item
  async remove(key: string): Promise<void> {
    await this.init();
    await this._storage?.remove(key);
  }

  // Clear all stored data
  async clear(): Promise<void> {
    await this.init();
    await this._storage?.clear();
  }

  // Get all keys
  async keys(): Promise<string[]> {
    await this.init();
    return await this._storage?.keys() || [];
  }
}