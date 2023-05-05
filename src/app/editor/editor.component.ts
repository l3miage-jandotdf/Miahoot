import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Miahoot{
  id: number;
  nom: string;
  questions: Question[];
}

interface Question{
  id : number | null;
  label : String;
  reponses: Answer[];
}

interface Answer {
  id : number | null;
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

  idMiahoot ! : number; //variable qui contiendra l'id du miahoot à modifier 

  idCreator ? : string;   //variable qui contiendra l'id du concepteur du miahoot à éditer

  questions ! : Question[];   //variable qui contin=endra les questions du miahoot à éditer

  //réponses ! : Answer[];    //variable qui contiendra les réponses de chaque question du miahoot

  
  /**
   * 
   * CONSTRUCTEUR 
   */
  constructor(private route: ActivatedRoute,  private router : Router, private http : HttpClient) { }

  
  ngOnInit() {
    this.idMiahoot = Number(this.route.snapshot.paramMap.get('idMiahoot')); //On récupère l'id du miahoot
    this.idCreator = String(this.route.snapshot.paramMap.get('idCreator')); //On réupère l'id du créateur 

    //On stocke le miahoot d'id idMiahoot 
    this.getMiahootById(this.idMiahoot)
    .then(miahoot => {
      this.miahoot = miahoot;
      this.questions = miahoot.questions;
      //this.réponses = miahoot.questions[0].answers;
      //console.log("reponse"+this.réponses);
      // Ajouter la boucle pour récupérer les réponses de chaque question
  })
  .catch(error => {
    console.error("An error with the function getMiahootById occured",error);
  });
  }



  /**
   * Fonction qui va rajouter une réponse suppélmentaire aux réponses de la question passée en paramètre
   * @param question 
   */
  addAnswer(question: Question): void {
    question.reponses.push({id : null, label:'', estValide:false});
  }


  /**
   * Fonction qui supprime la réponse à l'indice index 
   * @param question 
   * @param index 
   */
  removeAnswer(question: Question, index: number): void {
    question.reponses.splice(index, 1);
  }


  /**
   * Fonction qui rajoute une question supplémentaire aux questions du miahoot
   */
  addQuestion() {
    this.miahoot.questions.push({
      id : null,
      label: '',
      reponses: [{ id : null, label: '', estValide: false }]
    });
  }


  /**
   * Foncton qui supprime la question à l'indice index du miahoot
   * @param index 
   */
  removeQuestion(index: number): void{
    this.questions.splice(index, 1);
  }


  alreadyOneTrueOption(question : Question, index : number) : boolean{
    if (question.reponses.length > 1 && question.reponses[index].estValide == false){
      return question.reponses.reduce((acc, val) => acc || val.estValide, false);
    }
    else{
      return false;
    }
  }

  /**
   * 
   * @returns Soumission des modifications
   */

  /*
  submitMiahoot(){
    const url = 'http://localhost:8080/api/creator/' + this.idCreator + '/miahoot/';

    //Les données à mettre à jour
    const update = { 
      nom: this.miahoot.nom, 
      questions: this.miahoot.questions 
  }; 
    const promise = this.http.patch(url, update)
    .toPromise()
    .then(idMiahoot => {
      console.log('Miahoot avec l id '+ idMiahoot + 'a été modifié avec succès')
    })
    .catch(this.handleError);
    this.router.navigate(['all-miahoot', this.idCreator]);
    return promise;
}
  */

submitMiahoot() {
  const url = 'http://localhost:8080/api/creator/' + this.idCreator + '/miahoot/';

  // The data to update
  const update = {
    nom: this.miahoot.nom,
    questions: this.miahoot.questions.map(question => ({
      ...question,
      reponses: question.reponses
    }))
  };

  const promise = this.http.patch(url, update)
    .toPromise()
    .then(idMiahoot => {
      console.log('Miahoot with the id ' + idMiahoot + ' has been successfully modified');
    })
    .catch(this.handleError);
  this.router.navigate(['all-miahoot', this.idCreator]);
  return promise;
}



/**
 * Fonction qui récupère le miahoot dont l'id est passé en paramètre afin de permettre sa modification
 * @param idMiahoot 
 * @returns 
 */
/*
getMiahootById(idMiahoot: number): Promise<Miahoot> {
  const url = 'http://localhost:8080/api/creator/' +this.idCreator +'/miahoot/id/' + this.idMiahoot;
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
*/
getMiahootById(idMiahoot: number): Promise<Miahoot> {
  const url = 'http://localhost:8080/api/creator/' + this.idCreator + '/miahoot/id/' + this.idMiahoot;
  return this.http.get(url)
    .toPromise()
    .then(response => {
      const miahoot = response as Miahoot;
      console.log('Reponse:', response); 
      return miahoot;
    })
    .catch(error => {
      console.error('An error occurred:', error);
      return Promise.reject(error.message || error);
   });
}

getAnswersByQuestionId(questionId: number): Promise<any> {
  const url = 'http://localhost:8080/api/question/' + questionId + '/reponse/all';
  return this.http.get(url).toPromise()
    .then(response => response as Answer[])
    .catch(error => {
      console.error("An error with the function getAnswersByQuestionId occured",error);
      return [];
    });
}








  private handleError(error: any): Promise<Array<any>> {
    console.error('Une erreur est survenue.', error);
    return Promise.reject(error.message || error);
  }


  /**
   * Fonction qui recharge la page pour annuler les modifications
   */
  cancel() {
    location.reload();
  }

}

