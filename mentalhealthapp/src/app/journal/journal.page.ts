// src/app/journal/journal.page.ts
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AlertController, ModalController, IonicModule } from '@ionic/angular';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonItem, 
  IonTextarea, IonButton, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonChip, IonIcon, IonRippleEffect,
  IonSkeletonText, IonCardSubtitle
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  addOutline, 
  bookOutline, 
  calendarOutline, 
  timeOutline, 
  trashOutline,
  closeCircle
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { StorageService } from '../services/storage.service';
// Correctly import using your file name
import { JournalEntryModalComponent } from './journalentrymodal.component';

// Define the interface for journal entries
interface JournalEntry {
  id: string;
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonicModule, // Add IonicModule for ModalController
    IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonItem, 
    IonTextarea, IonButton, IonCard, IonCardHeader, IonCardTitle, 
    IonCardContent, IonChip, IonIcon, IonRippleEffect,
    IonSkeletonText, IonCardSubtitle, CommonModule, FormsModule,
    JournalEntryModalComponent
  ],
})
export class JournalPage implements OnInit {
  journalEntry = '';
  currentMood = '';
  entryTags: string[] = [];
  entries: JournalEntry[] = [];
  isLoading = true;
  moods = ['😊 Happy', '😢 Sad', '😴 Tired', '🤩 Excited', '😠 Angry', '😌 Calm'];
  
  constructor(
    private storageService: StorageService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {
    // Initialize icons - fixed to avoid duplicates
    addIcons({
      'add-outline': addOutline,
      'book-outline': bookOutline,
      'calendar-outline': calendarOutline,
      'time-outline': timeOutline,
      'trash-outline': trashOutline,
      'close-circle': closeCircle
    });
  }

  async ngOnInit() {
    try {
      this.loadJournalEntries();
    } catch (error) {
      console.error('Error in ngOnInit:', error);
      this.isLoading = false; // Make sure UI is still shown even if there's an error
    }
  }

  async loadJournalEntries() {
    this.isLoading = true;
    try {
      // Use typed storage service
      const storedEntries = await this.storageService.get<string>('journalEntries');
      
      if (storedEntries) {
        this.entries = JSON.parse(storedEntries);
        // Sort entries by date (newest first)
        this.entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async saveJournalEntry() {
    try {
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

      this.entries.unshift(newEntry); // Add to beginning of array
      
      // Use typed storage service
      await this.storageService.set<string>('journalEntries', JSON.stringify(this.entries));
      
      // Reset form
      this.journalEntry = '';
      this.currentMood = '';
      this.entryTags = [];
      
      this.presentAlert('Success', 'Your journal entry has been saved!');
    } catch (error) {
      console.error('Error saving journal entry:', error);
      this.presentAlert('Error', 'There was a problem saving your entry. Please try again.');
    }
  }

  async deleteEntry(entryId: string) {
    try {
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
              this.entries = this.entries.filter(entry => entry.id !== entryId);
              await this.storageService.set<string>('journalEntries', JSON.stringify(this.entries));
            }
          }
        ]
      });

      await alert.present();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  }

  async viewEntry(entry: JournalEntry) {
    try {
      const modal = await this.modalController.create({
        component: JournalEntryModalComponent,
        componentProps: {
          entry: entry
        },
        cssClass: 'journal-modal'
      });
      return await modal.present();
    } catch (error) {
      console.error('Error viewing entry:', error);
    }
  }

  async presentAlert(header: string, message: string) {
    try {
      const alert = await this.alertController.create({
        header,
        message,
        buttons: ['OK']
      });

      await alert.present();
    } catch (error) {
      console.error('Error presenting alert:', error);
    }
  }

  setMood(mood: string) {
    this.currentMood = mood;
  }

  async addTag() {
    try {
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
    } catch (error) {
      console.error('Error adding tag:', error);
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

  getPreviewText(text: string, maxLength = 100): string {
    // Using template literal instead of string concatenation
    return text.length <= maxLength ? text : `${text.substring(0, maxLength)}...`;
  }
}