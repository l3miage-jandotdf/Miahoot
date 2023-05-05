import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, DocumentData, DocumentSnapshot, getDoc, updateDoc } from '@angular/fire/firestore';
import { Question } from '../miahoot.model';

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

  constructor(private route : ActivatedRoute, private router : Router, private firestore : Firestore) {}

  async ngOnInit(): Promise<void> {
    this.idMiahoot = +(this.route.snapshot.paramMap.get('idMiahoot'))!;
    this.currentQuestionIndex = await this.getQuestionCouranteIndex(this.idMiahoot);
    console.log("QUESTION n° :" +  this.currentQuestionIndex);
    this.currentQuestion = await this.getQuestionById( this.firestore, this.idMiahoot, this.currentQuestionIndex!);
    console.log("QUESTION LABEL : " + this.currentQuestion?.label);
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

  async setNextQuestionCourante(): Promise<void> {
    const miahootDocRef = doc(this.firestore, 'miahoots', this.idMiahoot.toString());
    const miahootDocSnapshot: DocumentSnapshot<DocumentData> = await getDoc(miahootDocRef);
  
    if (miahootDocSnapshot.exists()) {
      const miahootData = miahootDocSnapshot.data();
      const questions = miahootData?.['questions'];
      const currentQuestionIndex = miahootData?.['questionCourante'];
  
      let nextQuestionIndex;
      if (currentQuestionIndex === null || currentQuestionIndex === undefined) {
        nextQuestionIndex = 0;
      } else {
        nextQuestionIndex = currentQuestionIndex + 1;
      }
  
      if (nextQuestionIndex < questions?.length) {
        await updateDoc(miahootDocRef, { questionCourante: nextQuestionIndex });
      }
    }
  }

  async passerSuivant(){
    this.setNextQuestionCourante();
    this.currentQuestionIndex = await this.getQuestionCouranteIndex(this.idMiahoot);
    console.log("QUESTION n° :" +  this.currentQuestionIndex);
    this.currentQuestion = await this.getQuestionById( this.firestore, this.idMiahoot, this.currentQuestionIndex!);
    console.log("QUESTION LABEL : " + this.currentQuestion?.label);
  }
  
}
