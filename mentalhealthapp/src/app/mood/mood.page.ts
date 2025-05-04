import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonFooter } from '@ionic/angular/standalone';


@Component({
  selector: 'app-mood',
  templateUrl: './mood.page.html',
  styleUrls: ['./mood.page.scss'],
  standalone: true,
  imports: [ IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonFooter]
})
export class MoodPage {
  // mood colours
  moodColours: { Happy: string; Sad: string; Excited: string; Anxious: string; Calm: string; Angry: string } = {
    Happy: '#FFECB3', // Pastel Yellow
    Sad: '#A7C7E7', // Pastel Blue
    Angry: '#FF8A80', // Pastel Red
    Excited: '#FFCC80', // Pastel Orange
    Calm: '#A8D5BA', // Pastel Green
    Anxious: '#D1A1D1' // Pastel Purple
  };

  moods: (keyof typeof this.moodColours)[] = ['Happy', 'Sad', 'Angry', 'Excited', 'Anxious'];
  selectedMood: string | null = null;

  selectMood(mood: string) {
    this.selectedMood = mood;
    }

  getMoodColour(mood: keyof typeof this.moodColours): string {
    return this.moodColours[mood] || '#FFFFFF'; // Default to white if mood not found
  }
}

