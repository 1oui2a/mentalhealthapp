import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet, RouterModule, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class AppComponent {
  constructor() {}
}
