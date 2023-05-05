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
  idCreator?: String;      //id du créateur
  private miahootConverter?: FirestoreDataConverter<Miahoot>;


  miahootTest: Miahoot = {
    id: 4444,
    nom: 'Mon quatrieme Miahoot',
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
    this.initMiahootFirebase(firestore);
  }

  async ngOnInit(){
    this.idCreator = String(this.route.snapshot.paramMap.get('idCreator'));
    await this.getMiahoots();
  }

  initMiahootFirebase(firestore : Firestore){
    const questionConverter : FirestoreDataConverter<Question> = {
      toFirestore(question: Question): any {
        return {
          id: question.id,
          label: question.label,
          answers: collection(firestore, 'questions', question.id.toString(), 'answers')
            .withConverter(reponseConverter)
        };
      },
      fromFirestore(snapshot: QueryDocumentSnapshot<any>): Question {
        const data = snapshot.data();
        return {
          id: data.id,
          label: data.label,
          answers: data.answers,
        };
      },
    };
    
    const reponseConverter : FirestoreDataConverter<Reponse> = {
      toFirestore(answer: Reponse): any {
        return {
          id: answer.id,
          label: answer.label,
          estValide: answer.estValide,
        };
      },
      fromFirestore(snapshot: QueryDocumentSnapshot<any>): Reponse {
        const data = snapshot.data();
        return {
          id: data.id,
          label: data.label,
          estValide: data.estValide,
        };
      },
    };
    
    this.miahootConverter = {
      toFirestore(miahoot: Miahoot): any {
        return {
          nom: miahoot.nom,
          questions: collection(firestore, 'miahoots', miahoot.id.toString(), 'questions')
            .withConverter(questionConverter)
        };
      },
      fromFirestore(snapshot: QueryDocumentSnapshot<any>): Miahoot {
        const data = snapshot.data();
        return {
          id: parseInt(snapshot.id),
          nom: data.nom,
          questions: data.questions,
        };
      },
    };
  }

  async addMiahoot(miahoot: Miahoot) {
    const miahootsCollection = collection(this.firestore, 'miahoots');
    const miahootDocRef = doc(miahootsCollection, miahoot.id.toString());
    const miahootData = this.miahootConverter?.toFirestore(miahoot);

    try {
      await setDoc(miahootDocRef, miahootData);
      console.log('Miahoot added successfully.');
    } catch (error) {
      console.error('Error adding miahoot: ', error);
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
