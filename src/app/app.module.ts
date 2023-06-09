
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { AccueilComponent } from './accueil/accueil.component';
import { AccountConfigComponent } from './account-config/account-config.component';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {MatToolbarModule} from '@angular/material/toolbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { RoleComponent } from './role/role.component';
import { CreatorComponent } from './creator/creator.component';
import { EditorComponent } from './editor/editor.component';
import { PresentatorComponent } from './presentator/presentator.component';
import { ParticipantComponent } from './participant/participant.component';
import { ResultComponent } from './result/result.component';
//import { QuestionService } from './question.service';
import {HttpClientModule} from "@angular/common/http";
import { AllMiahootComponent } from './all-miahoot/all-miahoot.component';
//import { nbParticipantService } from './nbParticipantService';
import { NavigationService } from './navigation.service';
import { QRCodeModule } from 'angularx-qrcode';


@NgModule({
  declarations: [
    AppComponent,
    AccueilComponent,
    AccountConfigComponent,
    LoginComponent,
    RoleComponent,
    CreatorComponent,
    EditorComponent,
    PresentatorComponent,
    ParticipantComponent,
    ResultComponent,
    AllMiahootComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    QRCodeModule
  ],
  providers: [NavigationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
