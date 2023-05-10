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


  //Constructeur
  constructor(private http: HttpClient, private route : ActivatedRoute, private router : Router) {}



  ngOnInit(): void {
    this.idCreator = String(this.route.snapshot.paramMap.get('idCreator'));
    //throw new Error('Method not implemented.');
  }


  /**
   * Sons pour les boutons
   */
  playClickSound() {
    const audio = new Audio();
    audio.src = '../assets/Pika.mp3'; 
    audio.load();
    audio.play();
  }

 
  /**
   * Fonction qui permet d'ajouter une question aux questions du miahoot en cours de création
   */
  addQuestion(): void{
    this.questions.push({label:'', answers:[]});
  }


  /**
   * Fonction qui permet de supprimer la question à l'indice index de la listes des questions du miahoot
   * en cours de création
   * @param index 
   */
  removeQuestion(index: number): void{
    this.questions.splice(index, 1);
  }

   /**
   * Fonction qui permet d'ajouter une réponse à la liste des réponses possibles de la question passée en paramètre
   * @param question 
   */
   addOption(question: Question): void {
    question.answers.push({label:'', estValide:false});
  }

/**
 * Fonction qui permet de supprimer la réponse à l'indice index de la listes des réponses de la question passée en paramètre
 * @param question 
 * @param index 
 */
  removeOption(question: Question, index: number): void {
    question.answers.splice(index, 1);
  }


  /**
   * Fonction qui nous permet de gérer le fait qu'on ne puisse dépasser 4 réponses pour une question dans un miahoot
   * en cours de création
   * @param question 
   * @returns 
   */
  moreThanFourOptions(question : Question) : boolean{
    return (question.answers.length < 4);
  }

  
  /**
   * Fonction qui vérifie si une question donnée possède déjà une réponse valide sélectionnée parmi ses réponses, 
   * sauf la réponse à l'indice donné en paramètre.
   * @param question 
   * @param index 
   * @returns 
   */
  alreadyOneTrueOption(question : Question, index : number) : boolean{
    if (question.answers.length > 1 && question.answers[index].estValide == false){
      return question.answers.reduce((acc, val) => acc || val.estValide, false);
    }
    else{
      return false;
    }
  }


/**
 * Fonction qui permet de soumettre le miahoot créé et redirige vers la page de tous les miahoots créés
 * @returns 
 */
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

  /**
   * Fonction qui permet de soumettre les QCMs 
   * @param idMiahoot 
   * @returns 
   */
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


  /**
   * Fonction qui permet de soumettre les réponses
   * @param idMiahoot 
   * @param idQuestion 
   * @param answersQuestion 
   * @returns 
   */
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

  /**
   * Fonction gestionnaire d'erreurs
   * @param error 
   * @returns 
   */
  private handleError(error: any): Promise<Array<any>> {
    console.error('Une erreur est survenue.', error);
    return Promise.reject(error.message || error);
  }

}
