import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, DocumentData, DocumentSnapshot, getDoc, collection, getDocs, onSnapshot } from '@angular/fire/firestore';
import { Question } from '../miahoot.model';
import { interval } from 'rxjs';

@Component({
  selector: 'app-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss']
})
export class ParticipantComponent {
  @Output() participant = new EventEmitter<boolean>();

  idMiahoot! : number;

  partieCommencee = false

  currentQuestion? : Question | null;
  currentQuestionIndex!: number | null;

  selectedAnswer = '';

  //@Output() startGameEvent = new EventEmitter<{ name: string, firstName: string, age: number }>();

  participantName !: string;
  participantFirstName !: string;
  participantAge !: number;

  constructor(private route : ActivatedRoute, private router : Router, private firestore : Firestore) {}

  async ngOnInit(): Promise<void> {
    this.idMiahoot = +(this.route.snapshot.paramMap.get('idMiahoot'))!;
    this.currentQuestionIndex = await this.getQuestionCouranteIndex(this.idMiahoot);
  }

  async getQuestionCouranteIndex(miahootId: number): Promise<number | null> {
    const miahootDocRef = doc(this.firestore, 'miahoots', miahootId.toString());
    const miahootDocSnapshot: DocumentSnapshot<DocumentData> = await getDoc(miahootDocRef);

    if (miahootDocSnapshot.exists()) {
      const miahootData = miahootDocSnapshot.data();
      const questionCourante = miahootData?.['questionCourante'];
      const miahootDocRef = doc(this.firestore, 'miahoots', miahootId.toString());
      onSnapshot(miahootDocRef, async (docSnapshot) => { //OBSERVABLE 
        const miahootData = docSnapshot.data();
        const questionCourante = miahootData?.['questionCourante'];
        this.currentQuestionIndex = questionCourante;
        this.currentQuestion = await this.getQuestionByIndex(this.idMiahoot, this.currentQuestionIndex!);
        console.log("QUESTION COURANTE CHANGEE : " + questionCourante);
      });

      return questionCourante ?? null;
    } else {
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
  

  //Début de jeu
  startGame() {
    const participantData = {
      name: this.participantName,
      firstName: this.participantFirstName,
      age: this.participantAge
    };
  }


  selectAnswer(answer: string) {
    // Mettre à jour la réponse sélectionnée
    this.selectedAnswer = answer;
  }

  submitAnswer() {
    // Envoyer la réponse sélectionnée au serveur
    console.log('le participant a sélectionné la réponse', this.selectedAnswer);

    // Passer à la question suivante

  }

  goToPage(){
    this.router.navigate([`/presentator/1`]);
  }

  commencerPartie() : void {
    this.partieCommencee = true;
  }
}
