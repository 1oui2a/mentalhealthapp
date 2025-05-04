// src/app/journal/journal.page.ts
import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonItem, 
  IonTextarea, IonButton, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonChip, IonIcon, IonRippleEffect,
  IonSkeletonText, IonCardSubtitle
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  bookOutline, 
  addOutline, 
  closeCircle, 
  calendarOutline,
  timeOutline,
  trashOutline
} from 'ionicons/icons';
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
    private storageService: StorageService,
    private alertController: AlertController
  ) {
    // Initialize icons
    addIcons({
      'book-outline': bookOutline,
      'add-outline': addOutline,
      'close-circle': closeCircle,
      'calendar-outline': calendarOutline,
      'time-outline': timeOutline,
      'trash-outline': trashOutline
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
      this.presentAlert('Empty Entry', 'Please write something in your journal before saving.');
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
    
    this.presentAlert('Success', 'Your journal entry has been saved!');
  }

  private async saveEntriesToStorage() {
    try {
      await this.storageService.set(this.STORAGE_KEY, JSON.stringify(this.entries));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  async deleteEntry(entryId: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this journal entry? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            const entryIndex = this.entries.findIndex(e => e.id === entryId);
            if (entryIndex !== -1) {
              this.entries.splice(entryIndex, 1);
              await this.saveEntriesToStorage();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Add the missing viewEntry method
  viewEntry(entry: JournalEntry) {
    // For now, just show an alert with the entry content
    this.presentAlert(
      entry.mood || 'Journal Entry', 
      entry.text
    );
  }

  // Add the missing getPreviewText method
  getPreviewText(text: string, maxLength = 100): string {
    return text.length <= maxLength ? text : `${text.substring(0, maxLength)}...`;
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }

  setMood(mood: string) {
    this.currentMood = this.currentMood === mood ? '' : mood;
  }

  addTag(tag: string) {
    // You can implement a more sophisticated tag adding here
    // For now, just prompt for a tag name
    this.promptForTag();
  }

  async promptForTag() {
    const alert = await this.alertController.create({
      header: 'Add Tag',
      inputs: [
        {
          name: 'tag',
          type: 'text',
          placeholder: 'Enter tag name'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: (data) => {
            if (data.tag.trim() !== '') {
              this.entryTags.push(data.tag.trim());
            }
          }
        }
      ]
    });

    await alert.present();
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