// src/app/journal/journal.page.ts
// Modify the JournalPage to directly use StorageService instead of JournalSyncService

import { Component, OnInit } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonItem, 
  IonTextarea, IonButton, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonChip, IonIcon, IonRippleEffect,
  IonSkeletonText, IonCardSubtitle
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { bookOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { StorageService } from '../services/storage.service';

interface JournalEntry {
  id?: string;
  text: string;
  date: string;
  mood?: string;
  tags?: string[];
}

@Component({
  selector: 'app-journal',
  templateUrl: '../journal/journal.page.html',
  styleUrls: ['../journal/journal.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonItem, 
    IonTextarea, IonButton, IonCard, IonCardHeader, IonCardTitle, 
    IonCardContent, IonChip, IonIcon, IonRippleEffect,
    IonSkeletonText, IonCardSubtitle, CommonModule, FormsModule,
  ]
})
export class JournalPage implements OnInit {
getPreviewText(arg0: string) {
throw new Error('Method not implemented.');
}
viewEntry(_t83: JournalEntry) {
throw new Error('Method not implemented.');
}
  journalEntry = '';
  currentMood = '';
  entryTags: string[] = [];
  entries: JournalEntry[] = [];
  isLoading = true;
  moods = ['😊 Happy', '😢 Sad', '😴 Tired', '🤩 Excited', '😠 Angry', '😌 Calm'];
  
  private readonly STORAGE_KEY = 'journalEntries';
  
  constructor(
    private storageService: StorageService
  ) {
    // Initialize icons
    addIcons({
      'book-outline': bookOutline,
    });
  }

  async ngOnInit() {
    this.loadJournalEntries();
  }

  async loadJournalEntries() {
    this.isLoading = true;
    try {
      const storedEntries = await this.storageService.get<string>(this.STORAGE_KEY);
      if (storedEntries) {
        this.entries = JSON.parse(storedEntries);
        // Sort by date (newest first)
        this.entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async saveJournalEntry() {
    if (this.journalEntry.trim() === '') {
      alert('Please write something in your journal before saving.');
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      text: this.journalEntry,
      date: new Date().toISOString(),
      mood: this.currentMood,
      tags: [...this.entryTags]
    };

    // Add to local entries
    this.entries.unshift(newEntry);
    await this.saveEntriesToStorage();
    
    // Reset form
    this.journalEntry = '';
    this.currentMood = '';
    this.entryTags = [];
  }

  private async saveEntriesToStorage() {
    try {
      await this.storageService.set(this.STORAGE_KEY, JSON.stringify(this.entries));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  async deleteEntry(entryId: string) {
    const confirmed = confirm('Are you sure you want to delete this journal entry?');
    if (!confirmed) return;
    
    const entryIndex = this.entries.findIndex(e => e.id === entryId);
    if (entryIndex !== -1) {
      this.entries.splice(entryIndex, 1);
      await this.saveEntriesToStorage();
    }
  }

  setMood(mood: string) {
    this.currentMood = this.currentMood === mood ? '' : mood;
  }

  addTag(tag: string) {
    if (tag && !this.entryTags.includes(tag)) {
      this.entryTags.push(tag);
    }
  }

  removeTag(index: number) {
    this.entryTags.splice(index, 1);
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}