import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


export interface Miahoot {
  id: number;
  nom: string;
  questions: Question[];
}

export interface Question {
  id: number;
  label: string;
  answers: Reponse[];
}

export interface Reponse {
  id: number;
  label: string;
  estValide: boolean;
}

@Component({
  selector: 'app-all-miahoot',
  templateUrl: './all-miahoot.component.html',
  styleUrls: ['./all-miahoot.component.scss']
})

export class AllMiahootComponent implements OnInit{
  miahoots?: Miahoot[];     //les miahoots
  idCreator?: number;      //id du créateur


  //constructeur
  constructor(private http: HttpClient, private route: ActivatedRoute, private router : Router) {}

  ngOnInit(){
    this.idCreator = Number(this.route.snapshot.paramMap.get('idCreator'));
    this.getMiahoots();
  }

  /**
   * Récupère tous les miahoots
   * @returns Promise résolue si la requête réussit, rejetée sinon
   */
  getMiahoots(): Promise<Miahoot[]> {
    const url = 'http://localhost:8080/api/creator/' + this.idCreator + '/miahoot/all';
    return this.http.get(url)
      .toPromise()
      .then(reponse => this.miahoots = reponse as Miahoot[])
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<Array<any>> {
    console.error('Une erreur est survenue.', error);
    return Promise.reject(error.message || error);
  }

  /**
   * Modifie le miahoot en allant sur la page d'édition
   * @param idMiahoot 
   */
  editMiahoot(idMiahoot: number): void {
    this.router.navigate([`/editor/${idMiahoot}`]);

  }
  

  /**
   * Supprime le miahoot en le récupérant depuis le back avec la requête http
   * @param idMiahoot 
   * @returns Promise résolue si la raquête réussit, rejetée en cas d'erreur
   */
  deleteMiahoot(idMiahoot: number): Promise<any> {
    const url = 'http://localhost:8080/api/creator/' + this.idCreator + '/miahoot/' + idMiahoot;
    return this.http.delete(url).toPromise()
        .then(() => {
            console.log(`Le Miahoot avec l'id ${idMiahoot} a été supprimé avec succès.`);
            return this.getMiahoots();    //On récupère les Miahoots mis à jour après suppression
        })
        .catch(this.handleError);
  }
  

  /**
   * Présente le miahoot d'id idMiahoot en basculant sur la page du présentateur
   * @param idMiahoot 
   */
  presentMiahoot(idMiahoot: number): void  {
      this.router.navigate([`/presentator/${idMiahoot}`]);

  }


 
  
}
