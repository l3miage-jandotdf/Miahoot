import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountConfigComponent } from './account-config/account-config.component';
import { AccueilComponent } from './accueil/accueil.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { CreatorComponent } from './creator/creator.component';
import { PresentatorComponent } from './presentator/presentator.component';
import { ParticipantComponent } from './participant/participant.component';
import { LoginComponent } from './login/login.component';
import { AllMiahootComponent } from './all-miahoot/all-miahoot.component';


const routes: Routes = [
{path:'', component:LoginComponent},
{path:"accueil", component:AccueilComponent},
{path:"accountConfig", component:AccountConfigComponent},
{path:"creator", component:CreatorComponent},
{path:"participant", component:ParticipantComponent},
{path:"presentator", component:PresentatorComponent},
{path:"all-miahoot", component:AllMiahootComponent}
/*{ path: '**', component: NotFoundComponent }*/];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}