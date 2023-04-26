import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountConfigComponent } from './account-config/account-config.component';
import { AccueilComponent } from './accueil/accueil.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { CreatorComponent } from './creator/creator.component';

const routes: Routes = [
{path:'', component:AccueilComponent},
{path:"accountConfig", component:AccountConfigComponent},
{path:"creator", component:CreatorComponent},
/*{ path: '**', component: NotFoundComponent }*/];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
