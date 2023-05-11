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


  /**
   * Fonction qui effectue une connexion anonyme à l'aide d'un service d'authentification Firebase
   *  et met à jour l'état de l'application en conséquence.
   */
  async loginAnonymously() {
    const result  = await signInAnonymously(this.auth);
    this.currentUser = this.navigation.user;
    this.navigation.setLog(true);
    this.navigation.setLogWithGoogle(false);
  }



  /**
   * Fonction qui permet à un utilisateur de se connecter à une application en utilisant le fournisseur d'authentification Google. 
   * Elle met également à jour l'état de l'application pour refléter la connexion de l'utilisateur.
   */
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



      }
    } finally {
      this.isAuthenticating = false;
    }

  }


  /**
   *  Fonction qui crée un nouvel enregistrement de créateur dans la base de données 
   * en utilisant les données de créateur passées en paramètre (dans l'objet creatorData).
   * @param creatorData 
   */
  createCreator(creatorData: any) {
    this.dataService.createCreator(creatorData).subscribe(
      (response) => {
        console.log('Creator est creé', response);
      },
      (error) => {
        console.log('Creator a echoué', error);
      }
    );

  }


  /**
   * Fonction assurant la navigation entre pages
   * @param pageName 
   */
  goToPage(pageName: string) {
    console.log(pageName);
    this.router.navigate([`${pageName}`]);
  }

  /**
   * Fonction qui permet de se déconnecter de l'application
   * @returns 
   */
  async logout() {
    if(this.url.startsWith("http://localhost:4200/participant/")){
      this.navigation.setLog(false);
      }
    else if(this.url.startsWith("http://localhost:4200")){
        this.goToPage('');
      }
    this.log.emit(false);
    this.navigation.setLog(false);
    this.navigation.setLogWithGoogle(false);
    return await signOut(this.auth);
  }

}
