import { ChangeDetectionStrategy, Component, OnInit, Optional } from '@angular/core';
import { Auth, User, signOut } from 'firebase/auth';
import { Observable, map } from 'rxjs';
import { DataService, MiahootUser } from '../data.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { authState } from '@angular/fire/auth';
import { traceUntilFirst } from '@angular/fire/performance';
import { NavigationService } from '../navigation.service';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccueilComponent implements OnInit {
idCreator?: String;

constructor(private router: Router, private routeAct : ActivatedRoute, private navigation:  NavigationService){
  this.idCreator = navigation.id;
}

  goToPage(pageName:string){
    if(pageName=="/creator"){
    }
    console.log(pageName);
    this.router.navigate([`${pageName}`]);
  }

  ngOnInit(): void {
    //this.idCreator = Number(this.routeAct.snapshot.paramMap.get('idCreator'));
    //throw new Error('Method not implemented.');
  }

  goToMyQuizs(){
    this.router.navigate(['all-miahoot', this.idCreator]);
  }  //le lien vers all-miahoot/{idCreator}... en cliquant sur le bouton Mes QCms

  /*public readonly user$?: Observable<User | null>;
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
    }
  }


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

  async logout() {
    this.pageCreation=false;
    return await signOut(this.auth);
  }

  goToPage(pageName:string){
    if(pageName=="/creator"){
      this.pageCreation=true;
    }
    console.log(pageName);
    this.router.navigate([`${pageName}`]);
  }

  updatePage() : void{
    this.pageCreation=true;
  }*/

}
