// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

// Import for IonicStorage
import { IonicStorageModule, Storage } from '@ionic/storage-angular';

// Basic bootstrap with Storage providers
bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    // Add the Storage providers correctly
    { provide: Storage, useFactory: () => {
        const storage = new Storage();
        storage.create();
        return storage;
    }}
  ],
});