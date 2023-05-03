import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from '../question';
import { QuestionService } from '../question.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  question !: Question;
  newAnswer !: string;

  constructor(private route: ActivatedRoute, private questionService: QuestionService, private router : Router) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.questionService.getQuestion(this.question.id)
      .subscribe(question => this.question = question);
  }

  addAnswer() {
    this.question.answers.push(this.newAnswer);
    this.newAnswer = '';
  }

  removeAnswer(index: number) {
    this.question.answers.splice(index, 1);
  }

  deleteQuestion() {
    this.questionService.deleteQuestion(this.question.id)
      .subscribe(() => {
        // rediriger vers une page de confirmation de suppression
      });
  }

  submitForm() {
    this.questionService.updateQuestion(this.question)
      .subscribe(() => {
        // rediriger vers une page de confirmation de modification
      });
  }

  

}

