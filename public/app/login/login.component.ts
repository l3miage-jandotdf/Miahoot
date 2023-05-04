import { Component, EventEmitter, OnInit, Optional, Output } from '@angular/core';
import { Auth, authState, signInAnonymously, signOut, User, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { DataService, MiahootUser } from '../data.service';
import { traceUntilFirst } from '@angular/fire/performance';
import { setDoc } from 'firebase/firestore';
import { HttpClient } from '@angular/common/http';


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

  url = window.location.href;

  public readonly isLoggedIn$?: Observable<boolean>;

  public isAuthenticating = false;

  @Output() log: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(@Optional() private auth: Auth, private router: Router, private dataService: DataService, private http: HttpClient/*, private window : Window*/) {
    if(this.url.startsWith("http://localhost:4200/participant/")){
      console.log("hello");
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
    this.log.emit(true);
    return await signInAnonymously(this.auth);
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

        if(this.url=="http://localhost:4200/"){
          this.goToPage("/accueil");
        }
        else if(this.url=="http://localhost:4200/participant/*"){
        }
        this.log.emit(true);


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
    if(this.url=="http://localhost/participant/*"){
      }
    else if(this.url=="http://localhost/*"){
        this.goToPage('');
      }
    this.log.emit(false);
    return await signOut(this.auth);
  }

}
