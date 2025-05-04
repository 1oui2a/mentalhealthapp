// src/app/services/journal-sync.service.ts
// this page is responsible for managing the journal entries, including adding, 
// updating, and deleting entries. It also handles the synchronization of entries
//  with Firebase when the device is online. 

import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentReference,
  CollectionReference
} from '@angular/fire/firestore';
import { Network } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';

export interface JournalEntry {
  id?: string;
  firebaseId?: string;
  text: string;
  date: string;
  mood?: string;
  tags?: string[];
  syncStatus?: 'synced' | 'pending' | 'error';
  lastModified?: any;
  _delete?: boolean; // For marking entries to be deleted when back online
}

@Injectable({
  providedIn: 'root'
})
export class JournalSyncService {
  private readonly JOURNAL_STORAGE_KEY = 'journalEntries';
  private readonly PENDING_SYNC_KEY = 'pendingJournalSync';
  private isOnline = false;
  private journalCollection: CollectionReference;
  private entriesSubject = new BehaviorSubject<JournalEntry[]>([]);
  public entries$ = this.entriesSubject.asObservable();

  constructor(
    private storageService: StorageService,
    private firestore: Firestore
  ) {
    this.journalCollection = collection(this.firestore, 'journalEntries');
    this.initNetworkListener();
    this.loadInitialData();
  }

  private async initNetworkListener() {
    // Initial network status
    const status = await Network.getStatus();
    this.isOnline = status.connected;

    // Listen for network status changes
    Network.addListener('networkStatusChange', (status) => {
      const wasOffline = !this.isOnline;
      this.isOnline = status.connected;
      
      // If we're coming back online, sync pending changes
      if (wasOffline && this.isOnline) {
        this.syncPendingEntries();
      }
    });
  }

  private async loadInitialData() {
    try {
      // First load data from local storage
      const localEntries = await this.loadFromStorage();
      this.entriesSubject.next(localEntries || []);

      // If online, fetch from Firebase and update local storage
      if (this.isOnline) {
        const firebaseEntries = await this.fetchFromFirebase();
        // Merge with local entries (keeping local changes marked as 'pending')
        const mergedEntries = this.mergeEntries(localEntries, firebaseEntries);
        await this.saveToStorage(mergedEntries);
        this.entriesSubject.next(mergedEntries);
      }

      // Set up real-time listener if online
      if (this.isOnline) {
        this.setupFirebaseListener();
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }

  private setupFirebaseListener() {
    const q = query(this.journalCollection, orderBy('date', 'desc'));
    
    // Listen for changes in Firebase
    onSnapshot(q, async (snapshot) => {
      if (!this.isOnline) return; // Ignore updates when offline
      
      try {
        const localEntries = await this.loadFromStorage();
        const firebaseEntries = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            firebaseId: doc.id,
            text: data.text,
            date: data.date,
            mood: data.mood,
            tags: data.tags,
            syncStatus: 'synced',
            lastModified: data.lastModified
          } as JournalEntry;
        });
        
        // Merge with local entries (keeping local changes marked as 'pending')
        const mergedEntries = this.mergeEntries(localEntries, firebaseEntries);
        await this.saveToStorage(mergedEntries);
        this.entriesSubject.next(mergedEntries);
      } catch (error) {
        console.error('Error in Firebase listener:', error);
      }
    }, (error) => {
      console.error('Firebase listener error:', error);
    });
  }

  // Merge entries from local storage and Firebase
  private mergeEntries(localEntries: JournalEntry[], firebaseEntries: JournalEntry[]): JournalEntry[] {
    // Create a map of firebase entries by ID for easy lookup
    const firebaseEntriesMap = new Map<string, JournalEntry>();
    firebaseEntries.forEach(entry => {
      if (entry.firebaseId) {
        firebaseEntriesMap.set(entry.firebaseId, entry);
      }
    });

    // Process local entries first
    const result: JournalEntry[] = localEntries
      .map(localEntry => {
        // If entry has a Firebase ID and is not pending sync
        if (localEntry.firebaseId && localEntry.syncStatus !== 'pending') {
          const firebaseEntry = firebaseEntriesMap.get(localEntry.firebaseId);
          
          // If the entry exists in Firebase and is newer, use it
          if (firebaseEntry && 
              firebaseEntry.lastModified && 
              localEntry.lastModified && 
              firebaseEntry.lastModified > localEntry.lastModified) {
            return firebaseEntry;
          }
          
          // Otherwise, keep local version but mark it as 'synced'
          return { ...localEntry, syncStatus: 'synced' };
        }
        
        // Keep pending entries as-is
        return localEntry;
      });
    
    // Add any new entries from Firebase that aren't in local storage
    firebaseEntries.forEach(firebaseEntry => {
      const exists = result.some(e => e.firebaseId === firebaseEntry.firebaseId);
      if (!exists) {
        result.push(firebaseEntry);
      }
    });
    
    // Sort by date (newest first)
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Fetch entries from Firebase
  private async fetchFromFirebase(): Promise<JournalEntry[]> {
    try {
      const q = query(this.journalCollection, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          firebaseId: doc.id,
          text: data.text,
          date: data.date,
          mood: data.mood,
          tags: data.tags,
          syncStatus: 'synced',
          lastModified: data.lastModified
        } as JournalEntry;
      });
    } catch (error) {
      console.error('Error fetching from Firebase:', error);
      return [];
    }
  }

  // Load entries from local storage
  private async loadFromStorage(): Promise<JournalEntry[]> {
    try {
      const storedEntries = await this.storageService.get<string>(this.JOURNAL_STORAGE_KEY);
      return storedEntries ? JSON.parse(storedEntries) : [];
    } catch (error) {
      console.error('Error loading from storage:', error);
      return [];
    }
  }

  // Save entries to local storage
  private async saveToStorage(entries: JournalEntry[]): Promise<void> {
    try {
      await this.storageService.set(this.JOURNAL_STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  // Add a new journal entry
  async addEntry(entry: JournalEntry): Promise<JournalEntry> {
    try {
      // Prepare entry with metadata
      const newEntry: JournalEntry = {
        ...entry,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        lastModified: new Date().getTime(),
        syncStatus: this.isOnline ? 'synced' : 'pending'
      };

      // Save to Firebase if online
      if (this.isOnline) {
        try {
          const entryData = {
            text: newEntry.text,
            date: newEntry.date,
            mood: newEntry.mood || '',
            tags: newEntry.tags || [],
            lastModified: serverTimestamp()
          };
          
          const docRef = await addDoc(this.journalCollection, entryData);
          newEntry.firebaseId = docRef.id;
          newEntry.syncStatus = 'synced';
        } catch (error) {
          console.error('Error adding to Firebase:', error);
          newEntry.syncStatus = 'error';
        }
      }

      // Add to local entries and save to storage
      const entries = await this.loadFromStorage();
      const updatedEntries = [newEntry, ...entries];
      await this.saveToStorage(updatedEntries);
      
      // Update the subject
      this.entriesSubject.next(updatedEntries);
      
      // If not synced, add to pending sync queue
      if (newEntry.syncStatus === 'pending') {
        await this.addToPendingSync(newEntry);
      }
      
      return newEntry;
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  }

  // Update an existing journal entry
  async updateEntry(entry: JournalEntry): Promise<JournalEntry> {
    try {
      // Update timestamp and set sync status
      const updatedEntry: JournalEntry = {
        ...entry,
        lastModified: new Date().getTime(),
        syncStatus: this.isOnline ? 'synced' : 'pending'
      };

      // Update in Firebase if online and has firebaseId
      if (this.isOnline && updatedEntry.firebaseId) {
        try {
          const entryRef = doc(this.firestore, 'journalEntries', updatedEntry.firebaseId);
          
          const entryData = {
            text: updatedEntry.text,
            date: updatedEntry.date,
            mood: updatedEntry.mood || '',
            tags: updatedEntry.tags || [],
            lastModified: serverTimestamp()
          };
          
          await updateDoc(entryRef, entryData);
          updatedEntry.syncStatus = 'synced';
        } catch (error) {
          console.error('Error updating in Firebase:', error);
          updatedEntry.syncStatus = 'error';
        }
      }

      // Update in local storage
      const entries = await this.loadFromStorage();
      const index = entries.findIndex(e => e.id === updatedEntry.id);
      
      if (index !== -1) {
        entries[index] = updatedEntry;
        await this.saveToStorage(entries);
        
        // Update the subject
        this.entriesSubject.next(entries);
        
        // If not synced, add to pending sync queue
        if (updatedEntry.syncStatus === 'pending') {
          await this.addToPendingSync(updatedEntry);
        }
        
        return updatedEntry;
      } else {
        throw new Error('Entry not found');
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  }

  // Delete a journal entry
  async deleteEntry(entryId: string): Promise<void> {
    try {
      const entries = await this.loadFromStorage();
      const entryIndex = entries.findIndex(e => e.id === entryId);
      
      if (entryIndex === -1) {
        throw new Error('Entry not found');
      }
      
      const entry = entries[entryIndex];
      
      // Delete from Firebase if online and has firebaseId
      if (this.isOnline && entry.firebaseId) {
        try {
          const entryRef = doc(this.firestore, 'journalEntries', entry.firebaseId);
          await deleteDoc(entryRef);
        } catch (error) {
          console.error('Error deleting from Firebase:', error);
          
          // Mark for deletion later if Firebase deletion fails
          if (!this.isOnline) {
            await this.addToPendingSync({
              ...entry,
              syncStatus: 'pending',
              _delete: true // Special marker for deletion
            });
          }
        }
      } else if (!this.isOnline && entry.firebaseId) {
        // Mark for deletion when back online
        await this.addToPendingSync({
          ...entry,
          syncStatus: 'pending',
          _delete: true
        });
      }
      
      // Remove from local storage
      entries.splice(entryIndex, 1);
      await this.saveToStorage(entries);
      
      // Update the subject
      this.entriesSubject.next(entries);
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }

  // Add entry to pending sync queue
  private async addToPendingSync(entry: JournalEntry): Promise<void> {
    try {
      const pendingSyncString = await this.storageService.get<string>(this.PENDING_SYNC_KEY);
      const pendingSync: JournalEntry[] = pendingSyncString ? JSON.parse(pendingSyncString) : [];
      
      // Remove any existing entries for this ID
      const filteredSync = pendingSync.filter(e => e.id !== entry.id);
      
      // Add the new entry
      filteredSync.push(entry);
      
      // Save back to storage
      await this.storageService.set(this.PENDING_SYNC_KEY, JSON.stringify(filteredSync));
    } catch (error) {
      console.error('Error adding to pending sync:', error);
    }
  }

  // Sync pending entries with Firebase
  async syncPendingEntries(): Promise<void> {
    if (!this.isOnline) {
      return; // Can't sync if offline
    }
    
    try {
      const pendingSyncString = await this.storageService.get<string>(this.PENDING_SYNC_KEY);
      if (!pendingSyncString) {
        return; // No pending syncs
      }
      
      const pendingSync: JournalEntry[] = JSON.parse(pendingSyncString);
      const successfulIds: string[] = [];
      
      for (const entry of pendingSync) {
        // Handle deletion
        if (entry._delete && entry.firebaseId) {
          try {
            const entryRef = doc(this.firestore, 'journalEntries', entry.firebaseId);
            await deleteDoc(entryRef);
            successfulIds.push(entry.id);
          } catch (error) {
            console.error('Error syncing deletion:', error);
          }
          continue;
        }
        
        // Handle creation or update
        const entryData = {
          text: entry.text,
          date: entry.date,
          mood: entry.mood || '',
          tags: entry.tags || [],
          lastModified: serverTimestamp()
        };
        
        if (entry.firebaseId) {
          // Update existing document
          try {
            const entryRef = doc(this.firestore, 'journalEntries', entry.firebaseId);
            await updateDoc(entryRef, entryData);
            successfulIds.push(entry.id);
          } catch (error) {
            console.error('Error syncing update:', error);
          }
        } else {
          // Create new document
          try {
            const docRef = await addDoc(this.journalCollection, entryData);
            
            // Update local entry with new firebaseId
            const entries = await this.loadFromStorage();
            const index = entries.findIndex(e => e.id === entry.id);
            
            if (index !== -1) {
              entries[index].firebaseId = docRef.id;
              entries[index].syncStatus = 'synced';
              await this.saveToStorage(entries);
              this.entriesSubject.next(entries);
            }
            
            successfulIds.push(entry.id);
          } catch (error) {
            console.error('Error syncing new entry:', error);
          }
        }
      }
      
      // Remove successful entries from pending sync
      if (successfulIds.length > 0) {
        const remainingSync = pendingSync.filter(entry => !successfulIds.includes(entry.id));
        await this.storageService.set(this.PENDING_SYNC_KEY, JSON.stringify(remainingSync));
        
        // Update sync status in local entries
        const entries = await this.loadFromStorage();
        let updated = false;
        
        for (let i = 0; i < entries.length; i++) {
          if (successfulIds.includes(entries[i].id)) {
            entries[i].syncStatus = 'synced';
            updated = true;
          }
        }
        
        if (updated) {
          await this.saveToStorage(entries);
          this.entriesSubject.next(entries);
        }
      }
    } catch (error) {
      console.error('Error syncing pending entries:', error);
    }
  }

  // Check if device is online
  isDeviceOnline(): boolean {
    return this.isOnline;
  }
}