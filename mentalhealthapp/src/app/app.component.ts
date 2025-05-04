import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { addIcons } from 'ionicons';
import { homeOutline, moonOutline, bookOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet, RouterModule, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  // Remove the HttpClient from here
})
export class AppComponent {
  constructor() {
    // Add the icons
    addIcons({
      'home': homeOutline,
      'moon': moonOutline,
      'book': bookOutline,
      'person': personOutline
    });
  }
}