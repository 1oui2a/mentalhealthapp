import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForwardOutline, refreshOutline } from 'ionicons/icons';
import { WellnessTipService, WellnessTip } from '../services/wellness-tip.service';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: Date;
  mood?: string;
  tags?: string[];
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonSpinner
  ],
})
export class HomePage implements OnInit {
  recentEntries: JournalEntry[] = [];
  dailyTip: WellnessTip = { quote: '', author: '' };
  isLoadingTip: boolean = true;
  
  // Simulate journal entries since we don't have your actual JournalService
  // Remove this when you connect to your real service
  mockEntries: JournalEntry[] = [
    {
      id: '1',
      title: 'Finding peace today',
      content: 'Today I discovered how creating a morning routine helped me start the day with a calmer mindset...',
      date: new Date()
    },
    {
      id: '2',
      title: 'Overcoming anxiety',
      content: 'I realized that I often feel anxious on Sunday evenings. Today I tried a new approach...',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      id: '3',
      title: 'Practicing gratitude',
      content: 'Listed three things I\'m grateful for today: 1. The supportive call from mom, 2. Finishing that project...',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    }
  ];
  
  constructor(
    private wellnessTipService: WellnessTipService
  ) {
    addIcons({
      'chevron-forward-outline': chevronForwardOutline,
      'refresh-outline': refreshOutline
    });
  }

  ngOnInit() {
    this.loadRecentEntries();
    this.loadWellnessTip();
  }

  loadRecentEntries() {
    // For now, use mock entries until you connect your real service
    this.recentEntries = this.mockEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }
  
  loadWellnessTip() {
    this.isLoadingTip = true;
    this.wellnessTipService.getDailyTip().subscribe((tip: WellnessTip) => {
      this.dailyTip = tip;
      this.isLoadingTip = false;
    });
  }
  
  refreshWellnessTip() {
    this.isLoadingTip = true;
    this.wellnessTipService.getAlternativeTip().subscribe((tip: WellnessTip) => {
      this.dailyTip = tip;
      this.isLoadingTip = false;
    });
  }
  
  getFormattedDate(date: Date): string {
    if (!date) return '';
    
    const entryDate = new Date(date);
    
    // For today's entries, show "Today"
    const today = new Date();
    if (entryDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // For yesterday's entries, show "Yesterday"
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (entryDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // For entries within the last week, show the day name
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (entryDate > oneWeekAgo) {
      return entryDate.toLocaleDateString('en-US', { weekday: 'long' });
    }
    
    // For older entries, show the full date
    return entryDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: entryDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }
  
  getPreview(content: string): string {
    // Create a preview of the journal content (first 100 characters)
    if (!content) return '';
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  }
}