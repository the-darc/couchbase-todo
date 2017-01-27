import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
// import { PouchDBProvider } from "../providers/pouchdb-provider";
import { CouchbaseLiteProvider } from "../providers/couchbase-lite-provider";


@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    // PouchDBProvider,
    CouchbaseLiteProvider
  ]
})
export class AppModule {}
