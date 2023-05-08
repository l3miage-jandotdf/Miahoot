import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, DocumentData, DocumentSnapshot, getDoc, updateDoc, collection, getDocs, query, orderBy, QuerySnapshot, onSnapshot } from '@angular/fire/firestore';

export interface Miahoot {
  id: number;
  nom: string;
  questionCourante: number | null;
  nbParticipants : number;
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
  nbParticipants: number | null = 0;

  miahootTermine : boolean = false; 
  topThree: [string, number][] = [];

  constructor(private route : ActivatedRoute, private router : Router, private firestore : Firestore) {}

  async ngOnInit(): Promise<void> {
    this.idMiahoot = +(this.route.snapshot.paramMap.get('idMiahoot'))!;
    this.currentQuestionIndex = await this.getQuestionCouranteIndex(this.idMiahoot);
    this.nbParticipants = await this.getNbParticipants();
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
      if (questionDocSnapshot !== undefined){
        if (questionDocSnapshot.exists()) {
          const questionData = questionDocSnapshot.data();
          return {
            id: questionData?.['id'],
            label: questionData?.['label'],
            answers: questionData?.['answers']
          } as Question;
        }
      }
    }
  
    return undefined;
  }
  
  


  async setNextQuestionCourante(): Promise<void> {
  const miahootDocRef = doc(this.firestore, 'miahoots', this.idMiahoot.toString());
  const miahootDocSnapshot = await getDoc(miahootDocRef);

  if (miahootDocSnapshot.exists()) {
    const miahootData = miahootDocSnapshot.data() as Miahoot;
    const questions = miahootData.questions;
    let nextQuestionIndex = (miahootData.questionCourante ?? 0) + 1;
    await updateDoc(miahootDocRef, { questionCourante: nextQuestionIndex });
  }
}

  async passerSuivant(){
    await this.setNextQuestionCourante();
    this.currentQuestionIndex = await this.getQuestionCouranteIndex(this.idMiahoot);
    console.log("QUESTION n° :" +  this.currentQuestionIndex);
    //Lorsque nous n'avons plus de question courante, cela signifie que le miahoot a pris fin.
    this.currentQuestion = await this.getQuestionByIndex(this.idMiahoot, this.currentQuestionIndex!);
    if (this.currentQuestion === undefined) {
      console.log("Le miahoot est terminé !");
      // On met 'miahootterminé à true pour pouvoir désactiver et ne plus afficher le bouton 'Suivant'
      this.topThree = await this.getTopThreeParticipants();
      this.miahootTermine = true;
    }
    console.log("QUESTION LABEL : " + this.currentQuestion?.label);
    
  }

  async getParticipantsScores(): Promise<[string, number][]> {
    const miahootDocRef = doc(this.firestore, 'miahoots', this.idMiahoot.toString());
    const miahootSnapshot = await getDoc(miahootDocRef);
  
    const participantsScores: {[key: string]: number} = {};
  
    const questionsSnapshot = await getDocs(collection(miahootDocRef, 'questions'));
  
    for (const questionDoc of questionsSnapshot.docs) {
      const votesSnapshot = await getDocs(collection(questionDoc.ref, 'votes'));
  
      for (const voteDoc of votesSnapshot.docs) {
        const userId = voteDoc.id;
        const voteData = voteDoc.data();
        const point = voteData['point'] || 0;
        participantsScores[userId] = (participantsScores[userId] || 0) + point;
        console.log("J'AI TROUVÉ UN PARTICIPANT !");
        console.log("IL A " + participantsScores[userId] +" POINT");
      }
    }
  
    return Object.entries(participantsScores);
  }

  async getTopThreeParticipants(): Promise<[string, number][]> {
    const participantsScores = await this.getParticipantsScores();
    participantsScores.sort((a, b) => b[1] - a[1]); // trier par ordre décroissant de score
  
    const topThree: [string, number][] = [];
  
    // Récupérer les trois premiers participants
    for (let i = 0; i < Math.min(participantsScores.length, 3); i++) {
      const [userId, score] = participantsScores[i];
      const participantDocRef = doc(this.firestore, 'users', userId);
      const participantDocSnapshot = await getDoc(participantDocRef);
      if (participantDocSnapshot.exists()) {
        const participantData = participantDocSnapshot.data()!;
        topThree.push([participantData['name'], score]);
      }
    }
  
    return topThree;
  }
  
  async getNbParticipants(): Promise<number | null> {
    const miahootDocRef = doc(this.firestore, 'miahoots', this.idMiahoot.toString());
    const miahootDocSnapshot: DocumentSnapshot<DocumentData> = await getDoc(miahootDocRef);
    if (miahootDocSnapshot.exists()) {
      const miahootData = miahootDocSnapshot.data();
      const nbParticipants = miahootData?.['nbParticipants'];
      const miahootDocRef = doc(this.firestore, 'miahoots', this.idMiahoot.toString());
      onSnapshot(miahootDocRef, async (docSnapshot) => {  //OBSERVABLE 
        const miahootData = docSnapshot.data();
        const nbParticipants = miahootData?.['nbParticipants'];
        this.nbParticipants = nbParticipants;
      });
      return nbParticipants ?? null;
    } else {
      return null;
    }
  }
  
  
}
