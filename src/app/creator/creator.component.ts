import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, from } from 'rxjs';

interface Question{
  question : String;
  answers: Answer[];
}

interface Answer {
  answer : String;
  estValide : boolean;
}

@Component({
  selector: 'app-creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatorComponent {
  //question !: string;
  nom : String = "";
  questions : Question[] = [];


  constructor(private http: HttpClient) {}

  addOption(question: Question): void {
    question.answers.push({answer:'', estValide:false});
  }

  removeOption(question: Question, index: number): void {
    question.answers.splice(index, 1);
  }

  addQuestion(): void{
    this.questions.push({question:'', answers:[]});
  }

  removeQuestion(index: number): void{
    this.questions.slice(index, 1);
  }

  submitMiahoot(){
      const url = 'http://localhost:8080/api/miahoot/';
      return this.http.post(url, { "nom": this.nom })
      .toPromise()
      .then(idMiahoot => {
        console.log('Miahoot créé avec l id '+ idMiahoot)
        this.submitQuestions(idMiahoot as Long);
      })
      .catch(this.handleError);
  }

  submitQuestions(idMiahoot : Long){
    const url = 'http://localhost:8080/api/miahoot/id/' + idMiahoot + '/question';
    console.log(url);
    return this.http.post(url, { }) //TODO
    .toPromise()
    .then(idQuestion => {
      console.log('Question créée avec l id '+ idQuestion)
      this.submitReponses(idMiahoot, idQuestion as Long);
    })
    .catch(this.handleError);
  }

  submitReponses(idMiahoot : Long, idQuestion : Long){
    const url = 'http://localhost:8080/api/miahoot/id/' + idMiahoot + '/question/' + idQuestion + '/reponse';
    console.log(url);
    return this.http.post(url, { }) //TODO
    .toPromise()
    .then(idReponse => {
      console.log('Question créée avec l id '+ idReponse)
    })
    .catch(this.handleError);
  }

  private handleError(error: any): Promise<Array<any>> {
    console.error('Une erreur est survenue.', error);
    return Promise.reject(error.message || error);
  }



}
