import { Component, OnInit } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonItem, 
  IonTextarea, IonButton, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonChip, IonIcon, IonRippleEffect,
  IonSkeletonText, IonCardSubtitle
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { 
  bookOutline, 
  timeOutline, 
  calendarOutline, 
  trashOutline, 
  closeCircle, 
  addOutline 
} from 'ionicons/icons';
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
  templateUrl: './journal.page.html',
  styleUrls: ['./journal.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonItem, 
    IonTextarea, IonButton, IonCard, IonCardHeader, IonCardTitle, 
    IonCardContent, IonChip, IonIcon, IonRippleEffect,
    IonSkeletonText, IonCardSubtitle, CommonModule, FormsModule,
  ]
})
export class JournalPage implements OnInit {
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
    addIcons({'bookOutline':bookOutline,'timeOutline':timeOutline,'calendarOutline':calendarOutline,'trashOutline':trashOutline,'closeCircle':closeCircle,'addOutline':addOutline});
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
    // If the tag is 'newTag', prompt the user for a custom tag
    if (tag === 'newTag') {
      const customTag = prompt('Enter a tag:');
      if (customTag && customTag.trim() !== '' && !this.entryTags.includes(customTag)) {
        this.entryTags.push(customTag);
      }
    } else if (tag && !this.entryTags.includes(tag)) {
      this.entryTags.push(tag);
    }
  }

  removeTag(index: number) {
    this.entryTags.splice(index, 1);
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    
    // For today's entries, show "Today"
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // For yesterday's entries, show "Yesterday"
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // For entries within the last week, show the day name
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (date > oneWeekAgo) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    
    // For older entries, show the full date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getPreviewText(text: string): string {
    if (!text) return '';
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  }

  viewEntry(entry: JournalEntry) {
    // For now, just display an alert with the entry details
    // Later you could navigate to a detail page
    alert(`${entry.mood || 'Journal Entry'}\n\n${entry.text}`);
  }
}