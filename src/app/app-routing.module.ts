import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { ChatComponent } from './Scénario/chat/chat.component';
import { AproposComponent } from './shared/apropos/apropos.component';

const routes: Routes = [
  { path: 'about', component: AproposComponent },
  { path: '', component: MainComponent },
  { path: 'chat/:scenario', component: ChatComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
