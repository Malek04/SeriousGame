import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { ChatComponent } from './Scénario/chat/chat.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'scenario1', component: ChatComponent },
  { path: 'scenario2', component: ChatComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
