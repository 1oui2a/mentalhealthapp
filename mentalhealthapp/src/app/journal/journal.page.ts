import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonItem, IonTextarea, IonButton } from '@ionic/angular/standalone'; // Make sure to import these components!
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf and ngFor
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

@Component({
  selector: 'app-journal',
  templateUrl: './journal.page.html',
  styleUrls: ['./journal.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonItem, IonTextarea, 
    IonButton, CommonModule, FormsModule], // Add these imports here
})
export class JournalPage {
  journalEntry: string = '';  // To hold the current journal entry text
  entries: string[] = [];  // To hold the list of saved journal entries
  
  constructor() {}


saveJournalEntry() {
    if (this.journalEntry.trim() !== '') {  // Check if the entry is not empty
      this.entries.push(this.journalEntry);  // Add the entry to the list
      this.journalEntry = '';  // Clear the input field
    }
  }
}
