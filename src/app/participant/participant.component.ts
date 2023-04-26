import { Component, Input } from '@angular/core';
import { Question } from '../question';

@Component({
  selector: 'app-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss']
})
export class ParticipantComponent {

  @Input() questions: Question[] = [];
  currentQuestionIndex = 0;
  currentQuestion: Question | undefined;
  selectedAnswer = '';

  ngOnInit() {
    // Initialiser la première question
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
}
