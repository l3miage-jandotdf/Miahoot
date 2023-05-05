import { NavigationService } from './../navigation.service';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';


interface Question{
  label : String;
  answers: Answer[];
}

interface Answer {
  label : String;
  estValide : boolean;
}

@Component({
  selector: 'app-creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatorComponent {
  nom : String = "";
  questions : Question[] = [];
  idCreator ? : String;


  constructor(private http: HttpClient, private route : ActivatedRoute, private router : Router) {

  }

  ngOnInit(): void {
    this.idCreator = String(this.route.snapshot.paramMap.get('idCreator'));
    //throw new Error('Method not implemented.');
  }

  playClickSound() {
    const audio = new Audio();
    audio.src = '../assets/Pika.mp3'; 
    audio.load();
    audio.play();
  }

  addOption(question: Question): void {
    question.answers.push({label:'', estValide:false});
  }

  removeOption(question: Question, index: number): void {
    question.answers.splice(index, 1);
  }

  addQuestion(): void{
    this.questions.push({label:'', answers:[]});
  }

  removeQuestion(index: number): void{
    this.questions.splice(index, 1);
  }

  moreThanFourOptions(question : Question) : boolean{
    return (question.answers.length < 4);
  }

  alreadyOneTrueOption(question : Question, index : number) : boolean{
    if (question.answers.length > 1 && question.answers[index].estValide == false){
      return question.answers.reduce((acc, val) => acc || val.estValide, false);
    }
    else{
      return false;
    }
  }

  submitMiahoot(){
      const url = 'http://localhost:8080/api/creator/' + this.idCreator + '/miahoot/';
      const promise = this.http.post(url, { "nom": this.nom })
      .toPromise()
      .then(idMiahoot => {
        console.log('Miahoot créé avec l id '+ idMiahoot)
        this.submitQuestions(idMiahoot as Long);
        
      })
      .catch(this.handleError);
      this.router.navigate(['all-miahoot', this.idCreator]);
      return promise;  
  }

  submitQuestions(idMiahoot : Long){
    const promises: Promise<Long>[] = [];
    const url = 'http://localhost:8080/api/miahoot/' + idMiahoot + '/question/';

    for (let i = 0; i < this.questions.length; i++) {
      const promise = this.http.post(url, {"label" : this.questions[i].label, "answers" : []}).toPromise()
      .then(idQuestion => {
        console.log(`Question créée avec l'id ${idQuestion}`);
        return this.submitReponses(idMiahoot, idQuestion as Long, this.questions[i].answers);
      }) as Promise<Long>
      promises.push(promise);
    }

    return Promise.all(promises).then(() => {
      console.log('Toutes les questions ont été créées avec succès');
    }).catch(this.handleError);
  }

  submitReponses(idMiahoot : Long, idQuestion : Long, answersQuestion : Answer[] ){
    const promises: Promise<Long>[] = [];
    const url = 'http://localhost:8080/api/question/' + idQuestion + '/reponse/';

    for (let i = 0; i < answersQuestion.length; i++) {
      const promise = this.http.post(url, {"label" : answersQuestion[i].label, "estValide" : answersQuestion[i].estValide}).toPromise() as Promise<Long>;
      promises.push(promise);
    }

    return Promise.all(promises).then(() => {
      console.log('Toutes les réponses de la question ' + idQuestion + ' ont été créées avec succès');
    }).catch(this.handleError);
  }

  private handleError(error: any): Promise<Array<any>> {
    console.error('Une erreur est survenue.', error);
    return Promise.reject(error.message || error);
  }

  
  createMiahoot(){
    this.router.navigate(['all-miahoot', this.idCreator]);
  }

}
