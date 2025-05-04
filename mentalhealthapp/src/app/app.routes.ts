import type { Routes } from '@angular/router';

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
