import { Firestore } from '@angular/fire/firestore';
import { Component, EventEmitter, OnInit, Optional, Output } from '@angular/core';
import { Auth, authState, signInAnonymously, signOut, User, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DataService, MiahootUser } from '../data.service';
import { traceUntilFirst } from '@angular/fire/performance';
import { setDoc } from 'firebase/firestore';
import { HttpClient } from '@angular/common/http';
import { NavigationService } from '../navigation.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  public readonly user$?: Observable<User | null>;
  public currentUser?: User | null;
  miahootUser: MiahootUser | undefined;
  participant=false;
  isLogin = false;

  url = window.location.href;

  public readonly isLoggedIn$?: Observable<boolean>;

  public isAuthenticating = false;

  @Output() log: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(@Optional() private auth: Auth, private router: Router, private dataService: DataService, private http: HttpClient, private navigation : NavigationService) {
    if(this.url.startsWith("http://localhost:4200/participant/")){
        this.participant=true;
    }
    console.log(this.url);
    console.log(this.participant)
    if (auth) {
      this.user$ = authState(this.auth);
      this.isLoggedIn$ = authState(this.auth).pipe(
        traceUntilFirst('auth'),
        map(u => {
          this.currentUser = u;
          if(this.currentUser!=null){
          this.navigation.setId(this.currentUser?.uid)
          }
          return !!u
        })
      );
    }

  }


  ngOnInit(): void {
    this.dataService.getMiahootUser$().subscribe(user => {
      this.miahootUser = user;
      console.log("y'a de l'action");
    });
  }


  async loginAnonymously() {
    const result  = await signInAnonymously(this.auth);
    this.currentUser = this.navigation.user;
    this.navigation.setLog(true);
    this.navigation.setLogWithGoogle(false);
    this.isLogin = true;
  }



  async login() {
    this.isAuthenticating = true;
    try {
      const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
      const user = result.user;
      if (user) {
        this.currentUser = user;
        const creatorData = {
          uid: user.uid,
          nom: user.displayName,
          photo: user.photoURL,
        };
        this.dataService.checkIfCreatorExists(user.uid).subscribe((exists) => {
          if (!exists) {
            this.createCreator(creatorData);
          } else {
            console.log('User already exists');
          }
        });

        if(this.url.startsWith("http://localhost:4200/participant/")){
        }
        else if(this.url.startsWith("http://localhost:4200")){
          this.goToPage("/accueil");
        }
        this.log.emit(true);
        this.navigation.setLog(true);
        this.navigation.setLogWithGoogle(true);
        this.isLogin = true;


      }
    } finally {
      this.isAuthenticating = false;
    }
  }

  createCreator(creatorData: any) {
    this.dataService.createCreator(creatorData).subscribe(
      (response) => {
        console.log('Creator a creé', response);
      },
      (error) => {
        console.log('Creator a echoué', error);
      }
    );

  }



  goToPage(pageName: string) {
    console.log(pageName);
    this.router.navigate([`${pageName}`]);
  }

  async logout() {
    if(this.url.startsWith("http://localhost:4200/participant/")){
      this.navigation.setLog(false);
      }
    else if(this.url.startsWith("http://localhost:4200")){
        this.goToPage('');
      }
    this.log.emit(false);
    this.isLogin=false;
    this.navigation.setLog(false);
    this.navigation.setLogWithGoogle(false);
    return await signOut(this.auth);
  }

}
