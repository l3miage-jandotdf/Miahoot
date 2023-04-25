import { Component, OnInit, OnDestroy, Optional } from '@angular/core';
import { Auth, authState, signInAnonymously, signOut, User, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { EMPTY, Observable, Subscription, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { traceUntilFirst } from '@angular/fire/performance';
import { Router } from '@angular/router';
import { setDoc } from 'firebase/firestore';
import { DataService, MiahootUser } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
  
export class AppComponent implements OnInit {
    title = 'Miahoot';
  
    public readonly user$?: Observable<User | null>;
    public currentUser? : User | null;
    miahootUser: MiahootUser | undefined;

  
    public readonly isLoggedIn$?: Observable<boolean>;

    public isAuthenticating = false;
  
    constructor(@Optional() private auth: Auth, private router: Router, private dataService: DataService) {
      if (auth) {
        this.user$ = authState(this.auth);
        this.isLoggedIn$ = authState(this.auth).pipe(
          traceUntilFirst('auth'),
          map(u => {
          this.currentUser = u;
          return !!u})
        );
        
      } 
    }
  
    ngOnInit(): void {
      this.dataService.getMiahootUser$().subscribe(user => {
        this.miahootUser = user;
        console.log ("y'a de l'action");
      });
     }
  
    async login() {
      this.isAuthenticating = true; // On indique que l'authentification est en cours
      try {
        await signInWithPopup(this.auth, new GoogleAuthProvider());
      } 
        finally {
        this.isAuthenticating = false; // On réinitialise la variable une fois que la promesse est résolue
      }
    }
  
    async loginAnonymously() {
      return await signInAnonymously(this.auth);
    }
  
    async logout() {
      return await signOut(this.auth);
    }

    goToPage(pageName:string){
      this.router.navigate([`${pageName}`]);
    }
  
}



