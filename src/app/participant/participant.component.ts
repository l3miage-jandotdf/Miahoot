import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, DocumentData, DocumentSnapshot, getDoc, collection, getDocs, onSnapshot, addDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { interval } from 'rxjs';
import { NavigationService } from '../navigation.service';
import { getAuth, updateProfile } from 'firebase/auth';

export interface Miahoot {
  id: number;
  nom: string;
  questionCourante: number | null;
  nbParticipants: number;
  nbVotesQuestionCourante: number;
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
  selectedAnswerIndex : number | null = null;
  idParticipant?: String;
  voteSubmited : boolean = false;

  participantName !: string;
  participantFirstName !: string;
  participantAge !: number;
  miahootTermine: boolean = false;

  login : boolean = false;
  loginWithGoogle = false;

  constructor(private route : ActivatedRoute, private router : Router, private firestore : Firestore, private navigation:  NavigationService) {
    console.log("partieCommencee : ",this.partieCommencee)

    this.navigation.id$.subscribe(value => {
      this.idParticipant=value;
      console.log("id du participant = ", this.idParticipant);
    });

    this.navigation.log$.subscribe(value => {
      this.login = value;
      console.log("login : ",this.login);
    });

    this.navigation.logWithGoogle$.subscribe(value => {
      this.loginWithGoogle = value;
      console.log("loginWithGoogle : ",this.loginWithGoogle);
    });

    if(this.login == false){
      this.partieCommencee = false;
      this.login = false;
      this.loginWithGoogle = false;
      this.miahootTermine = false;
      this.voteSubmited = false;
      console.log("Logout : ");
      console.log("partieCommencee : ",this.partieCommencee);
    }


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
        if (this.currentQuestion === undefined && this.currentQuestionIndex !==-1) {
          console.log("Le miahoot est terminé !");
          // On met 'miahootterminé à true pour pouvoir désactiver et ne plus afficher le bouton 'Suivant'
          this.miahootTermine = true;
        }
        this.voteSubmited = false;
        this.selectedAnswerIndex = null;

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


    // Si la collection contient des questions...
    if (querySnapshot.size > 0) {

      // On récupère le snapshot du document Firebase correspondant à l'indice de la question.
      const questionDocSnapshot = querySnapshot.docs[index];
      if (questionDocSnapshot !== undefined){

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
    }

    // On retourne undefined si la question n'existe pas.
    return undefined;
  }

  //Début de jeu
  async startGame() {
    const participantData = {
      name: this.participantName,
      firstName: this.participantFirstName,
      age: this.participantAge
    };
    //augmenter nbParticipants de 1
    const miahootDocRef = doc(this.firestore, 'miahoots', this.idMiahoot.toString());
    const miahootDocSnapshot = await getDoc(miahootDocRef);

    if (miahootDocSnapshot.exists()) {
      const miahootData = miahootDocSnapshot.data() as Miahoot;
      let nbParticipantsPlusUn = miahootData.nbParticipants + 1;
      await updateDoc(miahootDocRef, { nbParticipants: nbParticipantsPlusUn });
    }
  }

  selectVote(i : number){
    if (i===this.selectedAnswerIndex){
      this.selectedAnswerIndex = null;
    }
    else{
      this.selectedAnswerIndex = i;
    }
  }

  goToPage(){
    this.router.navigate([`/presentator/1`]);
  }

  commencerPartie() : void {
    if(this.loginWithGoogle){
      this.partieCommencee=true;
    }
    else{
      this.partieCommencee = true;
    const auth = getAuth();
    if(auth.currentUser!=null){
      if (this.participantName == null || this.participantName == undefined){this.participantName = "Anonyme";}
      updateProfile(auth.currentUser, {
        displayName : this.participantName,
        photoURL : "https://lh3.googleusercontent.com/36n3KSg9L1j79qoFeMyE17xeb73E3VzKQU3kWoloRKFmydtnVVFGRHk1nfRm3_Dv-fRX3a1bINDU5tuQ633ggaOFfPw9_KKsjDKppXNIHxPIq0v1aaAw8pXiVqKxYuxSDgYhVF8sGjuSJTzUGAx9614DnQKkbCqWay5W5DO6E8MJIa-aTF94ryRavLnzfL6Exf-tIqHsfpN-3Aplf0--e_Qtz8nDcEPfrzp5KyrI-7ys5WVqE0cb1B8iakOXCz239A3CcEkcJj3VWA_YPMe5P169CEWTsjvakENofQR7uQmYNBdzqECL8O1p5XNvjkNt4HaZl0TIxtSQs7nh_4NXkFXgbIADrZ49SE1UrCzb0zsn5xA1sURXpEVZfKYYc2Z3er-QZkq0vMMF_N5h5T9H47AuZhmx0WCpCjnmw6IhRWPM0ZUykOfdg3c-51ppod_S56Lm_9SVnEpP1Y7ry_SY2l1xipFHdGunBpx9rrKSz9H26FCx_oI3My-SlmDDbSXSrSUcZh6clnaaZJtXoxZLr5lNVfBc8fiXGXVqJ7FDFhjnjPKJvz9Qpj1Kdod5jUpa4KsH0qaUCE2VJDyCAuA2nxDR2GqAHo09DI_JfYc6gzWgeR4pqVJ8a4c0_b4eD7JpbTeTpFXhSHJ6h5IHwJyL6hQoDOZpQtjHH4jumv2kyqLLYk0QmdEunmtrg9XOv13FewYMlAbqzvBN9NWzyweGkPUYtA_or3MZ3crHeNnIIzDUCXtzDPFMfPeRZPJ2TCSOWpMhziCTwSPI3y51kzuVZ9Iw3DHUqwrWrFeyDG5srGfrpDMdDhoKfyxiyp5W5DzvsBzbAkISvWuJfKTduX60HoiREu416DOJxCU9yQBn1V8EaqOFyyYwfi9gEvgcgh9Y3BDOICtd2ud_4ZDUMEFRWFVuYqanikqOWuGdBUc0pMaAwtr3=w512-h512-s-no?authuser=0"
      }).then(() => {console.log(auth.currentUser?.displayName,auth.currentUser?.uid,auth.currentUser?.photoURL);
        if(auth.currentUser!=null){this.navigation.setUser(auth.currentUser)}})
    }
    }
  }

  alreadyOneTrueOption(i : number) : boolean{
    return (this.selectedAnswerIndex === null || this.selectedAnswerIndex===i);
  }

  async submitVote(): Promise<void> {
    this.voteSubmited = true;
    const questionDocRef = doc(
      this.firestore,
      'miahoots',
      this.idMiahoot.toString(),
      'questions',
      this.currentQuestion?.id!.toString()!
    );
    const voteData = {
      indexVoteSoumis: this.selectedAnswerIndex,
    };
    //enregistre le vote dans la collection "votes"
    const userId = this.idParticipant!.toString();
    const votesCollectionRef = collection(questionDocRef, 'votes');
    const voteDocRef = doc(votesCollectionRef, userId);
    await setDoc(voteDocRef, voteData);

    const miahootDocRef = doc(this.firestore, 'miahoots', this.idMiahoot.toString());
    const miahootDocSnapshot = await getDoc(miahootDocRef);
  
    if (miahootDocSnapshot.exists()) {
      const miahootData = miahootDocSnapshot.data() as Miahoot;
      let nbVotesPlusUn = miahootData.nbVotesQuestionCourante +1;
      await updateDoc(miahootDocRef, { nbVotesQuestionCourante: nbVotesPlusUn }); 
    }
  }


}
