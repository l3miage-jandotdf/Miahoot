import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountConfigComponent } from './account-config/account-config.component';
import { AccueilComponent } from './accueil/accueil.component';

const routes: Routes = [{path:'', component:AccueilComponent}, {path:"accountConfig", component:AccountConfigComponent}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
