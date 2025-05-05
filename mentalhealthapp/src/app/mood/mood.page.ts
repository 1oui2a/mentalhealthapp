import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent, 
  IonFooter,
  IonIcon,
  IonButton,
  GestureController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  happyOutline, 
  sadOutline, 
  flameOutline, 
  alertCircleOutline, 
  leafOutline, 
  thunderstormOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-mood',
  templateUrl: './mood.page.html',
  styleUrls: ['./mood.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    CommonModule, 
    FormsModule, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent, 
    IonFooter,
    IonIcon,
    IonButton
  ]
})
export class MoodPage implements OnInit {
  @ViewChild('moodContainer', { static: true }) moodContainer!: ElementRef;
  
  // mood colours
  moodColours: { [key: string]: string } = {
    Happy: '#FFECB3', // Pastel Yellow
    Sad: '#A7C7E7', // Pastel Blue
    Angry: '#FF8A80', // Pastel Red
    Excited: '#FFCC80', // Pastel Orange
    Calm: '#A8D5BA', // Pastel Green
    Anxious: '#D1A1D1' // Pastel Purple
  };

  moods: string[] = ['Happy', 'Sad', 'Angry', 'Excited', 'Anxious', 'Calm'];
  selectedMood: string | null = null;
  currentMoodIndex = 0;
  isTransitioning = false;
  
  // Icons mapping for each mood
  moodIcons: { [key: string]: string } = {
    Happy: 'happy-outline',
    Sad: 'sad-outline',
    Angry: 'thunderstorm-outline',
    Excited: 'flame-outline',
    Anxious: 'alert-circle-outline',
    Calm: 'leaf-outline'
  };

  constructor(private gestureCtrl: GestureController) {
    // Register Ionicons
    addIcons({
      'happy-outline': happyOutline,
      'sad-outline': sadOutline,
      'flame-outline': flameOutline,
      'alert-circle-outline': alertCircleOutline,
      'leaf-outline': leafOutline,
      'thunderstorm-outline': thunderstormOutline
    });
  }

  ngOnInit() {
    // Initialize with the first mood
    this.selectedMood = this.moods[this.currentMoodIndex];
    
    // We'll set up the gesture in ngAfterViewInit to ensure the view is fully loaded
  }

  ngAfterViewInit() {
    this.setupSwipeGesture();
  }

  setupSwipeGesture() {
    const element = this.moodContainer.nativeElement;
    
    const gesture = this.gestureCtrl.create({
      el: element,
      threshold: 15,
      direction: 'x',
      gestureName: 'swipe-mood',
      onStart: () => {
        // Optional: Add animation preparation here
      },
      onMove: (detail) => {
        // Optional: For more advanced animations during swipe
      },
      onEnd: (detail) => {
        if (this.isTransitioning) return;
        
        const deltaX = detail.deltaX;
        
        if (Math.abs(deltaX) > 70) { // Threshold to consider it a swipe
          this.isTransitioning = true;
          
          if (deltaX > 0) {
            // Swipe right - go to previous mood
            this.previousMood();
          } else {
            // Swipe left - go to next mood
            this.nextMood();
          }
          
          // Reset transition state after animation completes
          setTimeout(() => {
            this.isTransitioning = false;
          }, 300);
        }
      }
    });
    
    gesture.enable();
  }

  nextMood() {
    this.currentMoodIndex = (this.currentMoodIndex + 1) % this.moods.length;
    this.selectedMood = this.moods[this.currentMoodIndex];
  }

  previousMood() {
    this.currentMoodIndex = (this.currentMoodIndex - 1 + this.moods.length) % this.moods.length;
    this.selectedMood = this.moods[this.currentMoodIndex];
  }

  selectMood(moodIndex: number) {
    this.currentMoodIndex = moodIndex;
    this.selectedMood = this.moods[this.currentMoodIndex];
  }

  confirmMoodSelection() {
    // Handle mood selection confirmation
    console.log('Mood confirmed:', this.selectedMood);
    // Here you would typically save the mood or navigate to another page
  }

  getMoodColour(mood: string): string {
    return this.moodColours[mood] || '#FFFFFF'; // Default to white if mood not found
  }

  getCurrentMoodIcon(): string {
    return this.moodIcons[this.selectedMood as string] || 'help-outline';
  }
}