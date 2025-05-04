import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { homeOutline, moonOutline, bookOutline, personOutline, happy, musicalNotes } from 'ionicons/icons';

import { StorageService } from './services/storage.service';
// Import directly from '@ionic/storage-angular'
import { IonicStorageModule } from '@ionic/storage-angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  styleUrls: ['app.component.scss'],
  imports: [
    IonApp, 
    IonRouterOutlet, 
    RouterModule, 
    IonTabs, 
    IonTabBar, 
    IonTabButton, 
    IonIcon, 
    IonLabel,
    // IonicStorageModule.forRoot() should be moved to the application's bootstrap configuration
  ],
  // No need to provide StorageService here as it uses providedIn: 'root'
})
export class AppComponent {
  constructor(private storageService: StorageService) {
    // Initialize storage
    this.initStorage();
    
    // Add the icons
    addIcons({happy,musicalNotes,'home':homeOutline,'moon':moonOutline,'book':bookOutline,'person':personOutline});
  }

  // Make it async to properly initialize storage
  async initStorage() {
    await this.storageService.init();
  }
}