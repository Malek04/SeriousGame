import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { MainComponent } from './main/main.component';
import { CardsComponent } from './shared/cards/cards.component';
import { ChatComponent } from './Scénario/chat/chat.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { QuestionDialogComponent } from './Scénario/questions/questions.component';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RetryModalComponent } from './Scénario/retry-modal/retry-modal.component';
import { EndScenarioDialogComponent } from './Scénario/end-scenario-dialogue/end-scenario-dialogue.component';
import { AproposComponent } from './shared/apropos/apropos.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    MainComponent,
    CardsComponent,
    ChatComponent,
    QuestionDialogComponent,
    RetryModalComponent,
    EndScenarioDialogComponent,
    AproposComponent,
  ],
  imports: [
    MatDialogModule,
    CommonModule,
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonModule,
    HttpClientModule,
    FormsModule,
    MatIconModule,
    MatRadioModule,
    MatCheckboxModule,
    MatFormFieldModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
