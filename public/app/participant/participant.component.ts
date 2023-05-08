import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss']
})
export class ParticipantComponent {
  @Output() participant = new EventEmitter<boolean>();

  partieCommencee = false

  currentQuestionIndex = 0;

  selectedAnswer = '';

  //@Output() startGameEvent = new EventEmitter<{ name: string, firstName: string, age: number }>();

  participantName !: string;
  participantFirstName !: string;
  participantAge !: number;

  constructor(private router : Router) {
    this.participant.emit(true);
  }

  //Début de jeu
  startGame() {
    const participantData = {
      name: this.participantName,
      firstName: this.participantFirstName,
      age: this.participantAge
    };
  }

  ngOnInit() {
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
