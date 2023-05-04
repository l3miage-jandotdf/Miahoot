import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Question } from '../question';
import { nbParticipantService } from '../nbParticipantService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss']
})
export class ParticipantComponent {
  @Output() participant = new EventEmitter<boolean>();


  @Input() questions: Question[] = [];
  currentQuestionIndex = 0;
  currentQuestion: Question | undefined;
  selectedAnswer = '';

  @Output() startGameEvent = new EventEmitter<{ name: string, firstName: string, age: number }>();

  participantName !: string;
  participantFirstName !: string;
  participantAge !: number;

  constructor(private router : Router, private participantService: nbParticipantService) {
    this.participant.emit(true);
  }

  //Début de jeu
  startGame() {
    const participantData = {
      name: this.participantName,
      firstName: this.participantFirstName,
      age: this.participantAge
    };
    this.participantService.addReadyParticipant();
    this.startGameEvent.emit(participantData);
  }

  ngOnInit() {
    // Initialiser la première question
    this.participantService.readyParticipants.subscribe(readyParticipants => {
      console.log('Ready Participants: ', readyParticipants);
    });
    this.currentQuestion = this.questions[this.currentQuestionIndex];
  }

  selectAnswer(answer: string) {
    // Mettre à jour la réponse sélectionnée
    this.selectedAnswer = answer;
  }

  submitAnswer() {
    // Envoyer la réponse sélectionnée au serveur
    console.log('le participant a sélectionné la réponse', this.selectedAnswer);

    // Passer à la question suivante
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex < this.questions.length) {
      this.currentQuestion = this.questions[this.currentQuestionIndex];
    } else {
      console.log('Fin du QCM');
    }
  }

  goToPage(){
    this.router.navigate([`/presentator/1`]);
  }
}
