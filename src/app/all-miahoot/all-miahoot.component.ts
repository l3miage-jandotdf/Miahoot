import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { DocumentSnapshot, Firestore, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, doc, docData, getDocs } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of, switchMap } from 'rxjs';
import { collection, query, QuerySnapshot, where, setDoc } from 'firebase/firestore';

export interface Miahoot {
  id: number;
  nom: string;
  questionCourante: number | null;
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

  
  playClickSound() {
    const audio = new Audio();
    audio.src = '../assets/clickSoundAllMiahoot.mp3'; 
    audio.load();
    audio.play();
  }
  
  miahoots?: Miahoot[];     //les miahoots
  idCreator?: String;      //id du créateur


  miahootTest: Miahoot = {
    id: 6666,
    nom: 'Mon sixieme Miahoot',
    questionCourante: null,
    questions: [
      {
        id: 1,
        label: 'Question 1',
        answers: [
          { id: 1, label: 'Réponse 1', estValide: true },
          { id: 2, label: 'Réponse 2', estValide: false },
          { id: 3, label: 'Réponse 3', estValide: false },
        ],
      },
    ],
  };

  //constructeur
  constructor(private firestore: Firestore, private auth: Auth, private http: HttpClient, private route: ActivatedRoute, private router : Router) {
    
  }

  async ngOnInit(){
    this.idCreator = String(this.route.snapshot.paramMap.get('idCreator'));
    await this.getMiahoots();
  }

  // Méthode pour enregistrer un Miahoot sur Firestore
  async addMiahoot(miahoot: Miahoot): Promise<void> {
    const miahootDocRef = doc(this.firestore, 'miahoots', miahoot.id.toString());
    const miahootData = {
      nom: miahoot.nom,
      questionCourante: miahoot.questions.length > 0 ? miahoot.questions[0].id : null
    };
    await setDoc(miahootDocRef, miahootData);

    for (const question of miahoot.questions) {
      const questionDocRef = doc(miahootDocRef, 'questions', question.id.toString());
      const questionData = {
        label: question.label
      };
      await setDoc(questionDocRef, questionData);

      for (const reponse of question.answers) {
        const reponseDocRef = doc(questionDocRef, 'reponses', reponse.id.toString());
        const reponseData = {
          label: reponse.label,
          estValide: reponse.estValide
        };
        await setDoc(reponseDocRef, reponseData);
      }
    }
  }
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
    this.router.navigate([`/editor/${this.idCreator}/${idMiahoot}`]);

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
