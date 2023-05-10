import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentSnapshot, Firestore, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, addDoc, doc, docData, getDocs } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of, switchMap } from 'rxjs';
import { collection, query, QuerySnapshot, where, setDoc } from 'firebase/firestore';

export interface Miahoot {
  id: number;
  nom: string;
  //questionCourante: number | null;
  questions: Question[];
}

export interface Question {
  id: number;
  label: string;
  reponses: Reponse[];
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

export class AllMiahootComponent implements OnInit {


  playClickSound() {
    const audio = new Audio();
    audio.src = '../assets/clickSoundAllMiahoot.mp3';
    audio.load();
    audio.play();
  }

  miahoots?: Miahoot[];     //les miahoots
  idCreator?: String;      //id du créateur

  /*
    miahootTest: Miahoot = {
      id: 7777,
      nom: 'Mon septième Miahoot',
      questions: [
        {
          id: 1,
          label: 'Quelle est la meilleure fillière de l im2ag ?',
          answers: [
            { id: 1, label: 'MIAGE', estValide: true },
            { id: 2, label: 'Informatique général', estValide: false },
            { id: 3, label: 'Maths-Informatique', estValide: false },
          ],
        },
        {
          id: 5,
          label: 'Va t-on valider notre semestre ? ',
          answers: [
            { id: 1, label: 'Non, à cause de Gestion Comptable', estValide: false },
            { id: 2, label: 'Non, à cause d Angular', estValide: true },
            { id: 3, label: 'Non, à cause de BDD', estValide: false },
          ],
        },
      ],
    };
  */
  //constructeur
  constructor(private firestore: Firestore, private auth: Auth, private http: HttpClient, private route: ActivatedRoute, private router: Router) {

  }

  async ngOnInit() {
    this.idCreator = String(this.route.snapshot.paramMap.get('idCreator'));
    await this.getMiahoots();
  }

  /*
    // Ajouter une partie (miahoot présenté)
    async addMiahoot(miahoot: Miahoot): Promise<void> {
      const miahootDocRef = doc(this.firestore, 'miahoots', miahoot.id.toString());
      const miahootData = {
        nom: miahoot.nom,
        questionCourante: -1,  //ATTENTION C'EST UN INDEX
        nbParticipants: 0,
        nbVotesQuestionCourante: 0
      };
      await setDoc(miahootDocRef, miahootData);
  
      for (const question of miahoot.questions) {
        const questionDocRef = doc(miahootDocRef, 'questions', question.id.toString());
        const questionData = {
          id: question.id,
          label: question.label,
          answers: question.answers.map(answer => ({
            label: answer.label,
            estValide: answer.estValide
          }))
        };
        await setDoc(questionDocRef, questionData);
  
        const votesCollectionRef = collection(questionDocRef, 'votes');
      }
    }
    */
  // Ajouter une partie (miahoot présenté)
  async addMiahoot(miahoot: Miahoot): Promise<void> {
    const miahootDocRef = doc(this.firestore, 'miahoots', miahoot.id.toString());
    const miahootData = {
      nom: miahoot.nom,
      questionCourante: -1,  //ATTENTION C'EST UN INDEX
      nbParticipants: 0,
      nbVotesQuestionCourante: 0

    };
    await setDoc(miahootDocRef, miahootData);
    console.log('Miahoot document added:', miahootDocRef); // Add this line

    for (const question of miahoot.questions) {
      const questionDocRef = doc(miahootDocRef, 'questions', question.id.toString());
      const questionData = {
        id: question.id,
        label: question.label,
        answers: question.reponses.map(answer => ({
          label: answer.label,
          estValide: answer.estValide
        }))
      };
      await setDoc(questionDocRef, questionData);
      console.log('Question document added:', questionDocRef); // Add this line

      const votesCollectionRef = collection(questionDocRef, 'votes');
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
  presentMiahoot(idMiahoot: number): void {
    this.router.navigate([`/presentator/${idMiahoot}`]);

  }

  ajouterMiahoot() : void {
    this.router.navigate([`/creator/${this.idCreator}`]);

  }

}
