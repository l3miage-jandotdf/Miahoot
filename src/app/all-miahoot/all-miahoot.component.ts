import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { DocumentSnapshot, Firestore, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, doc, docData, getDoc } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of, switchMap } from 'rxjs';
import { setDoc } from 'firebase/firestore';


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
  private miahootConverter?: FirestoreDataConverter<Miahoot>;

  //constructeur
  constructor(private firestore: Firestore, private auth: Auth, private http: HttpClient, private route: ActivatedRoute, private router : Router) {
    this.initMiahootFirebase();
  }

  async ngOnInit(){
    this.idCreator = String(this.route.snapshot.paramMap.get('idCreator'));
    await this.getMiahoots();
  }

  initMiahootFirebase(){
    this.miahootConverter = {
      toFirestore(miahoot: Miahoot) {
        return {
          nom: miahoot.nom,
          questions: miahoot.questions.map((question: Question) => {
            return {
              id: question.id,
              label: question.label,
              answers: question.answers.map((answer: Reponse) => {
                return {
                  id: answer.id,
                  label: answer.label,
                  estValide: answer.estValide
                };
              })
            };
          })
        };
      },
      fromFirestore(snapshot: QueryDocumentSnapshot<Miahoot>, options: SnapshotOptions): Miahoot {
        const data = snapshot.data(options)!;
        const questions = data.questions.map((question: any) => {
          return {
            id: question.id,
            label: question.label,
            answers: question.answers.map((answer: any) => {
              return {
                id: answer.id,
                label: answer.label,
                estValide: answer.estValide
              };
            })
          };
        });
        return {
          id: parseInt(snapshot.id),
          nom: data.nom,
          questions: questions
        };
      }
    };
  }
/*
  addMiahoot(miahoot: Miahoot){
    return authState(this.auth).pipe(
      switchMap((user) => {
        if (user) {

          let docMia = doc(this.firestore, `miahoots/ ${miahoot.id.toString()}`);
          let refDocMia = docMia.withConverter(this.miahootConverter);
          let obsDoc: Observable<Miahoot> = docData(refDocMia);
          return setDoc(doc(this.firestore, ), miahoot, { converter: this.miahootConverter });
        } else {
          return of(null);
        }
      })
    );
  }
  */

  /**
   * Récupère tous les miahoots
   * @returns Promise résolue si la requête réussit, rejetée sinon
   */
  getMiahoots(): Promise<Miahoot[]> {
    const url = 'http://localhost:8080/api/creator/' + this.idCreator + '/miahoot/all';
    console.log("idCreator:", this.idCreator);
    return this.http.get(url)
      .toPromise()
      //.then(reponse => this.miahoots = reponse as Miahoot[])
      .then(reponse => {
        console.log('Raw response:', reponse);
        this.miahoots = reponse as Miahoot[];
        console.log('Miahoots:', this.miahoots);
        return this.miahoots;
      })
      
      
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
