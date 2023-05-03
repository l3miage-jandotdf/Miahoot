import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
  miahoots?: Miahoot[];
  idCreator?: number;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(){
    this.idCreator = Number(this.route.snapshot.paramMap.get('idCreator'));
    this.getMiahoots();
  }

  getMiahoots(): Promise<Miahoot[]> {
    const url = "http://localhost:8080/api/creator/${this.idCreator}/miahoot/all";
    return this.http.get(url)
      .toPromise()
      .then(reponse => this.miahoots = reponse as Miahoot[])
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<Array<any>> {
    console.error('Une erreur est survenue.', error);
    return Promise.reject(error.message || error);
  }
}
