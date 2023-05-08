import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Miahoot{
  id: number;
  nom: string;
  questions: Question[];
}

interface Question{
  label : String;
  answers: Answer[];
}

interface Answer {
  label : String;
  estValide : boolean;
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  miahoot ! : Miahoot; // la variable qui contiendra les informations du Miahoot à éditer

  idMiahoot ? : number;

  idCreator ? : number;

  questions ! : Question[];

  constructor(private route: ActivatedRoute,  private router : Router, private http : HttpClient) { }

  
  ngOnInit() {
    this.idMiahoot = Number(this.route.snapshot.paramMap.get('idMiahoot'));
    this.idCreator = Number(this.route.snapshot.paramMap.get('idCreator'));
  }


  addAnswer(question: Question): void {
    question.answers.push({label:'', estValide:false});
  }

  removeAnswer(question: Question, index: number): void {
    question.answers.splice(index, 1);
  }

  addQuestion() {
    this.miahoot.questions.push({
      label: '',
      answers: [{ label: '', estValide: false }]
    });
  }

  removeQuestion(index: number): void{
    this.questions.splice(index, 1);
  }


  /**
   * 
   * @returns Soumission des modifications
   */
  submitMiahoot(){
    const url = 'http://localhost:8080/api/creator/' + this.idCreator + '/miahoot/';
    const promise = this.http.post(url, { "nom": this.miahoot.nom })
    .toPromise()
    .then(idMiahoot => {
      console.log('Miahoot avec l id '+ idMiahoot + 'a été modifié avec succès')
      this.submitQuestions(idMiahoot as Long);
      this.router.navigate(['all-miahoot', this.idCreator]);
    })
    .catch(this.handleError);
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

    return Promise.any(promises).then(() => {
      console.log('Toutes les questions ont été créées avec succès');
    }).catch(this.handleError);
  }


  submitReponses(idMiahoot : Long, idQuestion : Long, answersQuestion : Answer[] ){
    const promises: Promise<Long>[] = [];
    const url = 'http://localhost:8080/api/miahoot/id/' + idMiahoot + '/question/' + idQuestion + '/reponse/';

    for (let i = 0; i < answersQuestion.length; i++) {
      const promise = this.http.post(url, {"label" : answersQuestion[i].label, "estValide" : answersQuestion[i].estValide}).toPromise() as Promise<Long>;
      promises.push(promise);
    }

    return Promise.any(promises).then(() => {
      console.log('Toutes les réponses de la question ' + idQuestion + ' ont été créées avec succès');
    }).catch(this.handleError);
  }


  private handleError(error: any): Promise<Array<any>> {
    console.error('Une erreur est survenue.', error);
    return Promise.reject(error.message || error);
  }

}

