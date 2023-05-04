import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  question !: Question;
  newAnswer !: string;
  questions ! : Question[];
  idMiahoot ? : number; 
  idCreator ? : number;


  constructor(private route: ActivatedRoute,  private router : Router, private http : HttpClient) { }

  
  ngOnInit() {
    this.idMiahoot = Number(this.route.snapshot.paramMap.get('idMiahoot'));
    this.idCreator = Number(this.route.snapshot.paramMap.get('idCreator'));
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


  /**
   * 
   * @returns Soumission des modifications
   */
  submit(){
    const url = 'http://localhost:8080/api/creator/' + this.idCreator +'/miahoot/'+this.idMiahoot+'/';
    return this.http.post(url, {})
    .toPromise()
    .then(idMiahoot => {
      console.log('Le miahoot d id' + idMiahoot + 'a été modifié')
      this.router.navigate(['all-miahoot', this.idCreator]);
      this.router.navigate(['all-miahoot', this.idCreator]);
    })
    .catch(this.handleError);
  }
  


  private handleError(error: any): Promise<Array<any>> {
    console.error('Une erreur est survenue.', error);
    return Promise.reject(error.message || error);
  }

}

