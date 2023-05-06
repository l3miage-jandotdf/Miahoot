import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, DocumentData, DocumentSnapshot, getDoc, collection, getDocs, onSnapshot } from '@angular/fire/firestore';
import { Question } from '../miahoot.model';
import { interval } from 'rxjs';
import { NavigationService } from '../navigation.service';

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
  selectedAnswer = ''; //TODO
  idParticipant?: String;

  participantName !: string;
  participantFirstName !: string;
  participantAge !: number;

  constructor(private route : ActivatedRoute, private router : Router, private firestore : Firestore, private navigation:  NavigationService) {
    this.navigation.id$.subscribe(value => {
      this.idParticipant=value;
      console.log("id du participant = ", this.idParticipant);
    });
  }

  async ngOnInit(): Promise<void> {
    this.idMiahoot = +(this.route.snapshot.paramMap.get('idMiahoot'))!;
    this.currentQuestionIndex = await this.getQuestionCouranteIndex(this.idMiahoot);
  }



/**
 * Récupère l'indice de la question courante pour un miahoot donné et crée un observable Firebase pour suivre les mises à jour.
 * @param miahootId l'id du miahoot pour lequel on veut récupérer l'indice de la question courante.
 * @returns La promesse d'un number ou null si la question courante n'existe pas.
 */
async getQuestionCouranteIndex(miahootId: number): Promise<number | null> {

  // On crée une référence à un document Firebase pour le miahoot d'id id.
  const miahootDocRef = doc(this.firestore, 'miahoots', miahootId.toString());

  // On récupère un snapshot du document Firebase correspondant.
  const miahootDocSnapshot: DocumentSnapshot<DocumentData> = await getDoc(miahootDocRef);

  // Si le snapshot existe
  if (miahootDocSnapshot.exists()) {

    // On extrait la valeur de la questionCourante stockée dans le document Firebase.
    const miahootData = miahootDocSnapshot.data();
    const questionCourante = miahootData?.['questionCourante'];

    // On crée un observable Firebase pour 'écouter' les changements de la question courante.
    const miahootDocRef = doc(this.firestore, 'miahoots', miahootId.toString());
    onSnapshot(miahootDocRef, async (docSnapshot) => {  //OBSERVABLE 
      
      // On extrait la nouvelle valeur de la questionCourante
      const miahootData = docSnapshot.data();
      const questionCourante = miahootData?.['questionCourante'];
      
      // On fait une mise à jour de la valeur de la question courante et on la récupère
      this.currentQuestionIndex = questionCourante;
      this.currentQuestion = await this.getQuestionByIndex(this.idMiahoot, this.currentQuestionIndex!);
      
      // On affiche un message dans la console pour indiquer que la question courante a été mise à jour.
      console.log("QUESTION COURANTE CHANGEE : " + questionCourante);
    });

    // On retourne la valeur initiale de la question courante ou null si elle n'existe pas.
    return questionCourante ?? null;

  } else {
    // On retourne null si le snapshot n'existe pas.
    return null;
  }
}



 /**
 * Récupère une question pour un miahoot donné à partir de son indice.
 * @param miahootId l'id du miahoot dans lequel on veut récupérer la question.
 * @param index l'indice de la question à récupérer.
 * @returns La question correspondante ou null si elle n'existe pas.
 */
async getQuestionByIndex(miahootId: number, index: number) {

  // On crée une référence à une collection Firebase pour les questions du miahoot donné.
  const questionsCollectionRef = collection(this.firestore, 'miahoots', miahootId.toString(), 'questions');

  // On récupère le snapshot de la collection Firebase correspondante.
  const querySnapshot = await getDocs(questionsCollectionRef);

  /*if (index >= querySnapshot.size) {
    return undefined;
  }*/


  // Si la collection contient des questions...
  if (querySnapshot.size > 0) {
    
    // On récupère le snapshot du document Firebase correspondant à l'indice de la question.
    const questionDocSnapshot = querySnapshot.docs[index];
    
    // Si le snapshot  du document existe.
    if (questionDocSnapshot.exists()) {
      
      // On extrait les données de la question stockées dans le document Firebase.
      const questionData = questionDocSnapshot.data();
      
      // On retourne l'objet représentant la question (son label, son id...)
      return {
        id: questionData?.['id'],
        label: questionData?.['label'],
        answers: questionData?.['answers']
      } as Question;
    }
  }

  // On retourne null si la question n'existe pas.
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
