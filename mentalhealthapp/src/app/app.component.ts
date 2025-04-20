import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet, RouterModule, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, HttpClient],
  providers: [HttpClient],
})
export class AppComponent {
  constructor() {}
}
