import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-meditation',
  templateUrl: './meditation.page.html',
  styleUrls: ['./meditation.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonLabel, CommonModule]
})
export class MeditationPage {
  timer: number = 5; // Default to 5 minutes
  timerInterval: any;
  isTimerRunning: boolean = false;
  minutes: number = 5; // Display minutes
  seconds: number = 0; // Display seconds

  // Start meditation timer
  startTimer() {
    this.isTimerRunning = true;
    this.timerInterval = setInterval(() => {
      if (this.seconds > 0) {
        this.seconds--;
      } else if (this.minutes > 0) {
        this.minutes--;
        this.seconds = 59;
      }

      if (this.minutes === 0 && this.seconds === 0) {
        clearInterval(this.timerInterval);
        this.isTimerRunning = false;
      }
    }, 1000);
  }

  // Reset the timer
  resetTimer() {
    clearInterval(this.timerInterval);
    this.isTimerRunning = false;
    this.minutes = 5;
    this.seconds = 0;
  }
}
