import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, DocumentData, DocumentSnapshot, getDoc, updateDoc, collection, getDocs, query, orderBy, QuerySnapshot } from '@angular/fire/firestore';

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
  selector: 'app-presentator',
  templateUrl: './presentator.component.html',
  styleUrls: ['./presentator.component.scss']
})


export class PresentatorComponent {

  //On prend en entrée les QCMs
  @Input() questions: Question[] = [];

  currentQuestion? : Question | null;
  currentQuestionIndex: number | null=1;
  idMiahoot! : number;

  miahootTermine : boolean = false; 

  constructor(private route : ActivatedRoute, private router : Router, private firestore : Firestore) {}

  async ngOnInit(): Promise<void> {
    this.idMiahoot = +(this.route.snapshot.paramMap.get('idMiahoot'))!;
    this.currentQuestionIndex = await this.getQuestionCouranteIndex(this.idMiahoot);
    console.log("QUESTION n° :" +  this.currentQuestionIndex);
  }

  async getQuestionCouranteIndex(miahootId: number): Promise<number | null> {
    const miahootDocRef = doc(this.firestore, 'miahoots', miahootId.toString());
    const miahootDocSnapshot: DocumentSnapshot<DocumentData> = await getDoc(miahootDocRef);

    if (miahootDocSnapshot.exists()) {
      const miahootData = miahootDocSnapshot.data();
      const questionCourante = miahootData?.['questionCourante'];
      return questionCourante ?? null;
    } else {
      return null;
    }
  }

  async getQuestionById(firestore: Firestore, miahootId: number, idQuestion: number): Promise<Question | null> {
    try {
      const miahootDocRef = doc(firestore, 'miahoots', miahootId.toString());
      const questionDocRef = doc(miahootDocRef, 'questions', idQuestion.toString());
      const questionDocSnapshot = await getDoc(questionDocRef);
  
      if (questionDocSnapshot.exists()) {
        const questionData = questionDocSnapshot.data();
        return {
          id: questionData?.['id'],
          label: questionData?.['label'],
          answers: questionData?.['answers']
        } as Question;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting question from Firestore:', error);
      return null;
    }
  }

  async getQuestionByIndex(miahootId: number, index: number) {
    const questionsCollectionRef = collection(this.firestore, 'miahoots', miahootId.toString(), 'questions');
    const querySnapshot = await getDocs(questionsCollectionRef);
    
    if (querySnapshot.size > 0) {
      const questionDocSnapshot = querySnapshot.docs[index];
      if (questionDocSnapshot.exists()) {
        const questionData = questionDocSnapshot.data();
        return {
          id: questionData?.['id'],
          label: questionData?.['label'],
          answers: questionData?.['answers']
        } as Question;
      }
    }
  
    return null;
  }
  
  


  async setNextQuestionCourante(): Promise<void> {
  const miahootDocRef = doc(this.firestore, 'miahoots', this.idMiahoot.toString());
  const miahootDocSnapshot = await getDoc(miahootDocRef);

  if (miahootDocSnapshot.exists()) {
    const miahootData = miahootDocSnapshot.data() as Miahoot;
    const questions = miahootData.questions;

    let nextQuestionIndex = (miahootData.questionCourante ?? 0) + 1;
    //if (nextQuestionIndex >= questions.length) {
    //  nextQuestionIndex = questions.length - 1;
    //}

    await updateDoc(miahootDocRef, { questionCourante: nextQuestionIndex });
  }
}

  async passerSuivant(){
    await this.setNextQuestionCourante();
    this.currentQuestionIndex = await this.getQuestionCouranteIndex(this.idMiahoot);
    console.log("QUESTION n° :" +  this.currentQuestionIndex);
    this.currentQuestion = await this.getQuestionByIndex(this.idMiahoot, this.currentQuestionIndex!);
    console.log("QUESTION LABEL : " + this.currentQuestion?.label);

    //Lorsque nous n'avons plus de question courante, cela signifie que le miahoot a pris fin.
    if (this.currentQuestion === undefined) {
      console.log("Le miahoot est terminé !");
      // On met 'miahootterminé à true pour pouvoir désactiver et ne plus afficher le bouton 'Suivant'
      this.miahootTermine = true;
      // Afficher une boite de dialogue pour indiquer au présentateur que le miahoot est terminé
      alert("Le miahoot est terminé :) !");
    }
  }
  
}
