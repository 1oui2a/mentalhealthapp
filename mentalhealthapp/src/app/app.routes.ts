import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { MoodPage } from './mood/mood.page';
import { JournalPage } from './journal/journal.page';
import { MeditationPage } from './meditation/meditation.page';
import { SettingsPage } from './settings/settings.page';
import { HttpClient } from '@angular/common/http';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'mood',
    loadComponent: () => import('./mood/mood.page').then( m => m.MoodPage)
  },
  {
    path: 'journal',
    loadComponent: () => import('./journal/journal.page').then( m => m.JournalPage)
  },
  {
  path: 'meditation',
  loadComponent: () => import('./meditation/meditation.page').then( m => m.MeditationPage)
  },  
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then( m => m.SettingsPage)
  },
];
