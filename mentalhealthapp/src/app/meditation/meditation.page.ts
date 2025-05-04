import { Component } from '@angular/core';
import type { OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  pauseOutline, 
  playOutline, 
  arrowBackOutline, 
  heartOutline,
  chevronDownOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-meditation',
  templateUrl: './meditation.page.html',
  styleUrls: ['./meditation.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule
  ]
})
export class MeditationPage implements OnDestroy {
  selectedDuration = 10; // Default to 10 minutes
  elapsedSeconds = 0;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  timerInterval: any;
  isTimerRunning = false;
  showDurationDropdown = false;

  constructor() {
    // Add Ionic icons
    addIcons({
      'pause': pauseOutline,
      'play': playOutline,
      'arrow-back-outline': arrowBackOutline,
      'heart-outline': heartOutline,
      'chevron-down-outline': chevronDownOutline
    });
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  // Toggle meditation timer
  toggleTimer() {
    if (this.isTimerRunning) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  // Start meditation timer
  startTimer() {
    this.isTimerRunning = true;
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      
      // Check if we've reached the selected duration
      if (this.elapsedSeconds >= this.selectedDuration * 60) {
        this.stopTimer();
        // You could add a sound or vibration here to indicate completion
      }
    }, 1000);
  }

  // Stop the timer
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.isTimerRunning = false;
  }

  // Reset and restart timer
  resetTimer() {
    this.stopTimer();
    this.elapsedSeconds = 0;
  }

  // Format time display as MM:SS
  formatTime(): string {
    const minutes = Math.floor(this.elapsedSeconds / 60);
    const seconds = this.elapsedSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Toggle duration dropdown
  toggleDurationDropdown() {
    this.showDurationDropdown = !this.showDurationDropdown;
  }

  // Select a new duration
  selectDuration(duration: number) {
    this.selectedDuration = duration;
    this.showDurationDropdown = false;
    this.resetTimer();
  }
}