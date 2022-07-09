import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MorseCodeMainComponent } from './morse-code-main/morse-code-main.component';

@NgModule({
  declarations: [
    AppComponent,
    MorseCodeMainComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
