import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { CoverFlowModule } from './providers/cover-flow/cover-flow.module';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CoverFlowModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
