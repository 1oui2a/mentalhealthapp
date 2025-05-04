// journal-entry-modal.component.ts
import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonIcon, IonChip, IonLabel, IonCard, IonCardContent
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { closeOutline, calendarOutline, timeOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

interface JournalEntry {
  id: string;
  text: string;
  date: string;
  mood?: string;
  tags?: string[];
}

@Component({
  selector: 'app-journal-entry-modal',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="light">
        <ion-title>Journal Entry</ion-title>
        <ion-button slot="end" fill="clear" (click)="dismiss()">
          <ion-icon name="close-outline"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div class="entry-date">
        <ion-icon name="calendar-outline"></ion-icon>
        {{ getFormattedDate(entry.date) }}
      </div>
      
      <div *ngIf="entry.mood" class="entry-mood">
        {{ entry.mood }}
      </div>
      
      <ion-card class="entry-content-card">
        <ion-card-content>
          <p class="entry-text">{{ entry.text }}</p>
        </ion-card-content>
      </ion-card>
      
      <div class="entry-tags" *ngIf="entry.tags && entry.tags.length > 0">
        <ion-chip *ngFor="let tag of entry.tags" color="tertiary">
          <ion-label>{{ tag }}</ion-label>
        </ion-chip>
      </div>
    </ion-content>
  `,
  styles: [`
    :host {
      --background-color: #f5f7fa;
      --card-background: #ffffff;
      --primary-color: #6a64f1;
      --text-color: #333333;
    }
    
    ion-content {
      --background: var(--background-color);
    }
    
    ion-toolbar {
      --background: var(--card-background);
      
      ion-title {
        font-weight: 600;
        color: var(--primary-color);
      }
    }
    
    .entry-date {
      display: flex;
      align-items: center;
      font-size: 0.9rem;
      margin-bottom: 16px;
      color: #666;
      
      ion-icon {
        margin-right: 6px;
        color: var(--primary-color);
      }
    }
    
    .entry-mood {
      font-size: 1.5rem;
      text-align: center;
      margin-bottom: 16px;
    }
    
    .entry-content-card {
      margin-bottom: 16px;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      background: var(--card-background);
      
      .entry-text {
        font-size: 1.1rem;
        line-height: 1.6;
        color: var(--text-color);
        white-space: pre-wrap;
      }
    }
    
    .entry-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }
  `],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonIcon, IonChip, IonLabel, IonCard, IonCardContent,
    CommonModule
  ]
})
export class JournalEntryModalComponent {
  @Input() entry: JournalEntry = {
    id: '',
    text: '',
    date: '',
    mood: '',
    tags: []
  };

  constructor(private modalController: ModalController) {
    addIcons({
      'close-outline': closeOutline,
      'calendar-outline': calendarOutline,
      'time-outline': timeOutline
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}