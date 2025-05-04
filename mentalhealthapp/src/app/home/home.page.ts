import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
//import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  providers: [],
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [RouterModule, IonicModule],
})
export class HomePage {
 
}
