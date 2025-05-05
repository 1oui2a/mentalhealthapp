import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MoodEntry {
  mood: string;
  color: string;
  icon: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class MoodService {
  private MOOD_STORAGE_KEY = 'currentMood';
  private _currentMood = new BehaviorSubject<MoodEntry | null>(null);

  // Define colors and icons for moods
  moodColors: { [key: string]: string } = {
    Happy: '#FFECB3', // Pastel Yellow
    Sad: '#A7C7E7', // Pastel Blue
    Angry: '#FF8A80', // Pastel Red
    Excited: '#FFCC80', // Pastel Orange
    Calm: '#A8D5BA', // Pastel Green
    Anxious: '#D1A1D1' // Pastel Purple
  };

    // Define icons for moods
  moodIcons: { [key: string]: string } = {
    Happy: 'happy-outline',
    Sad: 'sad-outline',
    Angry: 'thunderstorm-outline',
    Excited: 'flame-outline',
    Anxious: 'alert-circle-outline',
    Calm: 'leaf-outline'
  };

  // Define a list of moods
  constructor(private storageService: StorageService) {
    this.loadCurrentMood();
  }

  private async loadCurrentMood(): Promise<void> {
    try {
      const storedMood = await this.storageService.get<string>(this.MOOD_STORAGE_KEY);
      if (storedMood) {
        this._currentMood.next(JSON.parse(storedMood));
      }
    } catch (error) {
      console.error('Error loading current mood:', error);
    }
  }

  getCurrentMood(): Observable<MoodEntry | null> {
    return this._currentMood.asObservable();
  }

  // Save the current mood to storage
  async saveMood(mood: string): Promise<void> {
    try {
      const moodEntry: MoodEntry = {
        mood: mood,
        color: this.moodColors[mood] || '#FFFFFF',
        icon: this.moodIcons[mood] || 'help-outline',
        timestamp: new Date().toISOString()
      };

      await this.storageService.set(this.MOOD_STORAGE_KEY, JSON.stringify(moodEntry));
      this._currentMood.next(moodEntry);
    } catch (error) {
      console.error('Error saving mood:', error);
    }
  }

  async clearCurrentMood(): Promise<void> {
    try {
      await this.storageService.remove(this.MOOD_STORAGE_KEY);
      this._currentMood.next(null);
    } catch (error) {
      console.error('Error clearing mood:', error);
    }
  }

  // Function to get the formatted timestamp
  // This function formats the timestamp to a more human-readable format
  getFormattedTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If it's today
    if (date.toDateString() === now.toDateString()) {
      return 'Today at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise return date and time
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}