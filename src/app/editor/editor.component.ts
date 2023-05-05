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

  idMiahoot ! : string;

  idCreator ? : string;

  questions ! : Question[];

  constructor(private route: ActivatedRoute,  private router : Router, private http : HttpClient) { }

  
  ngOnInit() {
    this.idMiahoot = String(this.route.snapshot.paramMap.get('idMiahoot'));
    this.idCreator = String(this.route.snapshot.paramMap.get('idCreator'));
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
      this.getMiahootById(this.idMiahoot)
      console.log('Miahoot avec l id '+ idMiahoot + 'a été modifié avec succès')
    })
    .catch(this.handleError);
    this.router.navigate(['all-miahoot', this.idCreator]);
    return promise;
}
  


getMiahootById(idMiahoot: string): Promise<Miahoot> {
  const url = 'http://localhost:8080/api/creator/' +this.idCreator +'/miahoot/' + this.idMiahoot + '/';
  console.log("idCreator:", this.idCreator);
  return this.http.get(url)
    .toPromise()
    .then(response => {
      const miahoot = response as Miahoot;
      return miahoot;
    })
    .catch(error => {
      console.error('An error occurred:', error);
      return Promise.reject(error.message || error);
   });
}


 


  private handleError(error: any): Promise<Array<any>> {
    console.error('Une erreur est survenue.', error);
    return Promise.reject(error.message || error);
  }

  cancel() {
    // Recharge la page pour annuler les modifications
    location.reload();
  }

}

