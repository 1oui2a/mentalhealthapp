import { Component, ElementRef, AfterViewInit, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  GestureController,
  AnimationController,
  ToastController
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
import { MoodService } from '../services/mood.service';

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
export class MoodPage implements OnInit, AfterViewInit {
  @ViewChild('moodContainer', { static: false }) moodContainer!: ElementRef;
  
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
  debugMessage = ''; // For debugging
  
  // Icons mapping for each mood
  moodIcons: { [key: string]: string } = {
    Happy: 'happy-outline',
    Sad: 'sad-outline',
    Angry: 'thunderstorm-outline',
    Excited: 'flame-outline',
    Anxious: 'alert-circle-outline',
    Calm: 'leaf-outline'
  };

  constructor(
    private gestureCtrl: GestureController,
    private renderer: Renderer2,
    private animationCtrl: AnimationController,
    private moodService: MoodService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
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
    
    // Add keyboard navigation for testing
    this.setupKeyboardNavigation();
  }

  ngAfterViewInit() {
    // Wait for view to be ready before setting up gesture
    setTimeout(() => {
      this.setupSwipeGesture();
    }, 300);
  }

  setupKeyboardNavigation() {
    // Add keyboard listener for arrow keys (useful for testing on web)
    document.addEventListener('keydown', (event) => {
      if (this.isTransitioning) return;
      
      if (event.key === 'ArrowLeft') {
        this.debugMessage = 'Left arrow pressed';
        this.goToPreviousMood();
      } else if (event.key === 'ArrowRight') {
        this.debugMessage = 'Right arrow pressed';
        this.goToNextMood();
      }
    });
  }

  setupSwipeGesture() {
    if (!this.moodContainer) {
      console.error('Mood container element not found!');
      this.debugMessage = 'Error: Mood container not found';
      return;
    }
    
    const element = this.moodContainer.nativeElement;
    
    // Create a swipe gesture detector
    const gesture = this.gestureCtrl.create({
      el: element,
      threshold: 15,
      direction: 'x',
      gestureName: 'swipe-mood',
      onStart: () => {
        this.debugMessage = 'Swipe started';
      },
      onMove: (detail) => {
        // Show visual feedback during swipe
        if (Math.abs(detail.deltaX) > 10) {
          this.debugMessage = `Swiping: ${detail.deltaX.toFixed(0)}px`;
          
          // Limited transform effect to show direction
          const transform = `translateX(${detail.deltaX / 8}px)`;
          this.renderer.setStyle(element, 'transform', transform);
        }
      },
      onEnd: (detail) => {
        if (this.isTransitioning) return;
        
        // Reset styles immediately
        this.renderer.removeStyle(element, 'transform');
        
        const deltaX = detail.deltaX;
        this.debugMessage = `Swipe ended: ${deltaX.toFixed(0)}px`;
        
        if (Math.abs(deltaX) > 70) { // Threshold to consider it a swipe
          if (deltaX > 0) {
            // Swipe right - go to previous mood
            this.debugMessage = 'Going to previous mood';
            this.goToPreviousMood();
          } else {
            // Swipe left - go to next mood
            this.debugMessage = 'Going to next mood';
            this.goToNextMood();
          }
        }
      }
    });
    
    // Enable the gesture
    gesture.enable();
    this.debugMessage = 'Swipe gesture enabled';
  }

  goToNextMood() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    // Calculate the next mood index
    const nextIndex = (this.currentMoodIndex + 1) % this.moods.length;
    const nextMood = this.moods[nextIndex];
    
    this.debugMessage = `Current: ${this.selectedMood}, Next: ${nextMood}`;
    
    // Get current container
    const element = this.moodContainer.nativeElement;
    
    // Create exit animation
    const exitAnimation = this.animationCtrl.create()
      .addElement(element)
      .duration(300)
      .easing('ease-out')
      .fromTo('opacity', '1', '0')
      .fromTo('transform', 'translateX(0)', 'translateX(-50px)');
    
    // Play exit animation
    exitAnimation.play().then(() => {
      // IMPORTANT: Update mood state AFTER animation completes
      this.currentMoodIndex = nextIndex;
      this.selectedMood = nextMood;
      
      // Wait a moment for Angular to update the view with the new mood
      setTimeout(() => {
        // Create entrance animation
        const enterAnimation = this.animationCtrl.create()
          .addElement(element)
          .duration(300)
          .easing('ease-in')
          .fromTo('opacity', '0', '1')
          .fromTo('transform', 'translateX(50px)', 'translateX(0)');
        
        // Play entrance animation
        enterAnimation.play().then(() => {
          this.isTransitioning = false;
          this.debugMessage = `Now showing: ${this.selectedMood}`;
        });
      }, 50);
    });
  }

  goToPreviousMood() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    // Calculate the previous mood index
    const prevIndex = (this.currentMoodIndex - 1 + this.moods.length) % this.moods.length;
    const prevMood = this.moods[prevIndex];
    
    this.debugMessage = `Current: ${this.selectedMood}, Previous: ${prevMood}`;
    
    // Get current container
    const element = this.moodContainer.nativeElement;
    
    // Create exit animation
    const exitAnimation = this.animationCtrl.create()
      .addElement(element)
      .duration(300)
      .easing('ease-out')
      .fromTo('opacity', '1', '0')
      .fromTo('transform', 'translateX(0)', 'translateX(50px)');
    
    // Play exit animation
    exitAnimation.play().then(() => {
      // IMPORTANT: Update mood state AFTER animation completes
      this.currentMoodIndex = prevIndex;
      this.selectedMood = prevMood;
      
      // Wait a moment for Angular to update the view with the new mood
      setTimeout(() => {
        // Create entrance animation
        const enterAnimation = this.animationCtrl.create()
          .addElement(element)
          .duration(300)
          .easing('ease-in')
          .fromTo('opacity', '0', '1')
          .fromTo('transform', 'translateX(-50px)', 'translateX(0)');
        
        // Play entrance animation
        enterAnimation.play().then(() => {
          this.isTransitioning = false;
          this.debugMessage = `Now showing: ${this.selectedMood}`;
        });
      }, 50);
    });
  }

  selectMood(moodIndex: number) {
    if (this.isTransitioning) return;
    this.currentMoodIndex = moodIndex;
    this.selectedMood = this.moods[this.currentMoodIndex];
    this.debugMessage = `Selected mood: ${this.selectedMood}`;
  }

  async confirmMoodSelection() {
    if (!this.selectedMood) return;
    
    // Save the selected mood
    await this.moodService.saveMood(this.selectedMood);
    
    // Show toast confirmation
    const toast = await this.toastCtrl.create({
      message: `You selected "${this.selectedMood}" as your mood today`,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    
    await toast.present();
    
    // Navigate back to home page
    this.router.navigate(['/home']);
  }

  getMoodColour(mood: string): string {
    return this.moodColours[mood] || '#FFFFFF'; // Default to white if mood not found
  }

  getCurrentMoodIcon(): string {
    return this.moodIcons[this.selectedMood as string] || 'help-outline';
  }
}