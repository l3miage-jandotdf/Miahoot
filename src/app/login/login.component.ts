import { Component, OnInit, Optional } from '@angular/core';
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
  public currentUser? : User | null;
  miahootUser: MiahootUser | undefined;
  pageCreation = false;


  public readonly isLoggedIn$?: Observable<boolean>;

  public isAuthenticating = false;

  constructor(@Optional() private auth: Auth, private router: Router, private dataService: DataService, private http: HttpClient) {
    if (auth) {
      this.user$ = authState(this.auth);
      this.isLoggedIn$ = authState(this.auth).pipe(
        traceUntilFirst('auth'),
        map(u => {
        this.currentUser = u;
        return !!u})
      );
      this.pageCreation=false;
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
    this.http.post('http://localhost:8080/api/miahoot/', {"nom":"testM"}).subscribe((response) => {
      this.afficheMiahoot();
      console.log("MIAHOOT CREE !!");
    });
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

  updatePage() : void{
    this.pageCreation=true;
  }


}
