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
  pageCreation = false;


  public readonly isLoggedIn$?: Observable<boolean>;

  public isAuthenticating = false;

  @Output() log: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(@Optional() private auth: Auth, private router: Router, private dataService: DataService, private http: HttpClient) {
    if (auth) {
      this.user$ = authState(this.auth);
      this.isLoggedIn$ = authState(this.auth).pipe(
        traceUntilFirst('auth'),
        map(u => {
          this.currentUser = u;
          return !!u
        })
      );
      this.pageCreation = false;
    }
  }

  /*
    createNewMiahoot() {
      this.http.post('http://localhost:8080/api/miahoot', {}).subscribe(() => {
        console.log("MIAHOOT CREE !!")
      });
    }
  */
  afficheMiahoot() {
    this.http.get('http://localhost:8080/api/miahoot/nom/testM', {}).subscribe((response) => {
      console.log(response);
      console.log("MIAHOOT affiche !!");
    });
  }
  createNewMiahoot() {
    this.http.post('http://localhost:8080/api/miahoot/', { "nom": "testM" }).subscribe((response) => {
      this.afficheMiahoot();
      console.log("MIAHOOT CREE !!");
    });
  }

  ngOnInit(): void {
    this.dataService.getMiahootUser$().subscribe(user => {
      this.miahootUser = user;
      console.log("y'a de l'action");
    });
  }
  /*
    async login() {
      this.isAuthenticating = true; // On indique que l'authentification est en cours
      try {
        await signInWithPopup(this.auth, new GoogleAuthProvider());
      }
        finally {
        this.isAuthenticating = false; // On réinitialise la variable une fois que la promesse est résolue
      }
    }
  */
  async loginAnonymously() {
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


  /* async logout() {
     this.pageCreation=false;
     return await signOut(this.auth);
   }
 
   goToPage(pageName:string){
     if(pageName=="/creator"){
       this.pageCreation=true;
     }
     console.log(pageName);
     this.router.navigate([`${pageName}`]);
   }*/

  updatePage(): void {
    this.pageCreation = true;
  }

  async logout() {
    return await signOut(this.auth);
  }

}
