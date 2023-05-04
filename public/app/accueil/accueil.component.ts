import { ChangeDetectionStrategy, Component, OnInit, Optional } from '@angular/core';
import { Auth, User, signOut } from 'firebase/auth';
import { Observable, map } from 'rxjs';
import { DataService, MiahootUser } from '../data.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { authState } from '@angular/fire/auth';
import { traceUntilFirst } from '@angular/fire/performance';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccueilComponent implements OnInit {
idCreator: any;

constructor(private router: Router, private routeAct : ActivatedRoute){}

  goToPage(pageName:string){
    if(pageName=="/creator"){
    }
    console.log(pageName);
    this.router.navigate([`${pageName}`]);
  }

  ngOnInit(): void {
    this.idCreator = Number(this.routeAct.snapshot.paramMap.get('idCreator'));
    //throw new Error('Method not implemented.');
  }

  goToMyQuizzs(){
    this.router.navigate(['all-miahoot', this.idCreator]);
  }  //le lien vers all-miahoot/{idCreator}... en cliquant sur le bouton Mes QCms


}
