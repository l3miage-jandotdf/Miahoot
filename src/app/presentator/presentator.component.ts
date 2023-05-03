import { Component, Inject, Input, OnInit } from '@angular/core';
import { Question } from '../question';
import { nbParticipantService } from '../nbParticipantService';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-presentator',
  templateUrl: './presentator.component.html',
  styleUrls: ['./presentator.component.scss']
})

export class PresentatorComponent implements OnInit {

  //On prend en entrée les QCMs
  @Input() questions: Question[] = [];

  currentQuestionIndex = 0;     //index de la question courante
  currentQuestion: Question | undefined;    //question courante
  selectedAnswer: string | undefined;   //réponse sélectionnée par le participant
  correctAnswer = false;    //réponse correcte
  //participantAnswers: string[] = [];    //réponses choisies par les participants

  readyParticipants: number = 0;

  constructor(private participantService: nbParticipantService) { }

  
  ngOnInit() {
    this.participantService.getReadyParticipants().subscribe((count) => {
      this.readyParticipants = count;
    });
    this.currentQuestion = this.questions[this.currentQuestionIndex]; //on affiche la première question dès que le composant est affiché
  }
  
  //Fonction qui affiche les QCMs
  showQuestion(questionIndex: number) {
    // Récupérer la question et l'afficher
    this.currentQuestion = this.questions[questionIndex];
    this.selectedAnswer = undefined; // Réinitialiser la réponse sélectionnée
    this.correctAnswer = false; // Réinitialiser la réponse correcte
  }
  
  //Fonction qui permet de pouvoir accéder à la question précédente (bouton implémentée dans la vue)
  //VERSION 1 OU PLUS
  showPrevQuestion() {
    // Afficher la question précédente
    if (this.currentQuestionIndex > 0) {    //on vérifie que ce n'est pas la première question (sinon impossible de revenir en arrière)
      this.currentQuestionIndex--;          //on prend l'index de la quetsion qui a précédé
      this.showQuestion(this.currentQuestionIndex);   //et on l'affiche
    }
  }
  
  showNextQuestion() {
    // Afficher la question suivante
    if (this.currentQuestionIndex < this.questions.length - 1) {    //S'ikl y'a encore des questions (c-à-d pas la dernière question)
      this.currentQuestionIndex++;          //on prend l'index de la question suivante 
      this.showQuestion(this.currentQuestionIndex);   //on l'affiche
    }
  }
}
