import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Miahoot {
  id: number;
  nom: string;
  questions: Question[];
}

interface Question {
  id: number | null;
  label: String;
  reponses: Reponse[];
  miahootId:number | null;
}

interface Reponse {
  id: number | null;
  label: String;
  estValide: boolean;
  questionId:number | null;
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  miahoot !: Miahoot; // la variable qui contiendra les informations du Miahoot à éditer

  idMiahoot !: number; //variable qui contiendra l'id du miahoot à modifier 

  idCreator?: string;   //variable qui contiendra l'id du concepteur du miahoot à éditer

  questions !: Question[];   //variable qui contin=endra les questions du miahoot à éditer

  reponses !: Reponse[];    //variable qui contiendra les réponses de chaque question du miahoot

  showInputList: boolean[] = [];

  @Output() refreshMiahootEvent = new EventEmitter();

  /**
   * 
   * CONSTRUCTEUR 
   */
  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) { }

  ngOnInit() {
    this.idMiahoot = Number(this.route.snapshot.paramMap.get('idMiahoot')); //On récupère l'id du miahoot
    this.idCreator = String(this.route.snapshot.paramMap.get('idCreator')); //On réupère l'id du créateur 
    this.refreshMiahootEvent.subscribe(() => {
      this.refreshMiahoot();
    });
    //On stocke le miahoot d'id idMiahoot 
    this.getMiahootById(this.idMiahoot)
      .then(miahoot => {
        this.miahoot = miahoot;
        this.questions = miahoot.questions;
      })
      .catch(error => {
        console.error("An error with the function getMiahootById occured", error);
      });
  }



  /**
   * Fonction qui va rajouter une réponse suppélmentaire aux réponses de la question passée en paramètre
   * @param questionId
   * @param reponseLabel
   */
  showNewReponseInput: boolean = false;
  newReponseLabel: string = '';
  newReponseValide: boolean = false;

  showReponseInput(index: number) {
    this.showInputList[index] = true;
  }

  async addReponse(newReponseValide: boolean,reponseLabel: string, question: Question) {
    const newReponse: Reponse = {
      id: null,
      label: reponseLabel,
      estValide: false,
      questionId: question.id
    };

    const url = 'http://129.88.210.85:8080/api/question/' + question.id + '/reponse/';
    const body = {
      label: newReponse.label,
      estValide: newReponseValide,
      questionId: question.id
    };
    console.log('Reponse créé avec label :' + newReponse.label);

    try {
      const response = await this.http.post(url, body).toPromise();
      console.log('Reponse créé');
      question.reponses.push(response as Reponse);
      this.refreshMiahootEvent.emit();
    } catch (error) {
      console.error('Erreur lors de la création de la reponse:', error);
    }
    this.newReponseLabel = '';
    this.showNewReponseInput = false;

  }

  /**
   * Fonction qui supprime la réponse à l'indice index 
   * @param questionId
   * @param reponseId
   */
  async removeAnswer(reponse: Reponse): Promise<void> {
    const url = 'http://129.88.210.85:8080/api/question/' + reponse.questionId + '/reponse/'+reponse.id;
    try {
       await this.http.delete(url).toPromise();
      console.log('Reponse supprime');
    } catch (error) {
      console.error('Erreur lors de la supprime de la reponse:', error);
    }
  }


  /**
   * Fonction qui rajoute une question supplémentaire aux questions du miahoot
   * @param questionLabel
   */
  showNewQuestionInput: boolean = false;
  newQuestionLabel: string = '';

  showQuestionInput() {
    this.showNewQuestionInput = !this.showNewQuestionInput;
  }

  async addQuestion(questionLabel: string) {
    const newQuestion: Question = {
      id: null,
      label: questionLabel,
      reponses: [{ id: null, label: '', estValide: false, questionId : null}],
      miahootId: this.idMiahoot
    };

    const url = 'http://129.88.210.85:8080/api/miahoot/' + this.idMiahoot + '/question/';
    const body = {
      label: newQuestion.label,
      miahootId: this.idMiahoot,
    };
    console.log('Question créé avec label :' + newQuestion.label);

    try {
      const response = await this.http.post(url, body).toPromise();
      console.log('Question créé');
      this.miahoot.questions.push(response as Question);
      this.refreshMiahootEvent.emit();
    } catch (error) {
      console.error('Erreur lors de la création de la question:', error);
    }
    this.newQuestionLabel = '';
    this.showNewQuestionInput = false;

  }



  /**
   * Foncton qui supprime la question à l'indice index du miahoot
   * @param question 
   */
  async removeQuestion(question: Question): Promise<void> {
    const url = 'http://129.88.210.85:8080/api/miahoot/' + this.idMiahoot + '/question/'+question.id;
    try {
      await this.http.delete(url).toPromise();
     console.log('Question supprime');
   } catch (error) {
     console.error('Erreur lors de la supprime de la question:', error);
   }
  }


  alreadyOneTrueOption(question: Question, index: number): boolean {
    if (question.reponses.length > 1 && question.reponses[index].estValide == false) {
      return question.reponses.reduce((acc, val) => acc || val.estValide, false);
    }
    else {
      return false;
    }
  }


  refreshMiahoot() {
    this.getMiahootById(this.idMiahoot)
      .then(miahoot => {
        this.miahoot = miahoot;
        this.questions = miahoot.questions;
      })
      .catch(error => {
        console.error("An error with the function getMiahootById occured", error);
      });
  }


  submitMiahoot() {
    const url = 'http://129.88.210.85:8080/api/creator/' + this.idCreator + '/miahoot/' + this.idMiahoot;

    // Les données à mettre à jour
    const update = {
      id: this.idMiahoot,
      nom: this.miahoot.nom,
      questions: this.miahoot.questions.map(question => ({
        ...question,
        miahootId: this.idMiahoot,
        reponses: question.reponses
      }))
    };

    const promise = this.http.patch(url, update)
      .toPromise()
      .then(idMiahoot => {
        console.log('le Miahoot d id ' + idMiahoot + ' a été modifié avec succès');
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

  getMiahootById(idMiahoot: number): Promise<Miahoot> {
    const url = 'http://129.88.210.85:8080/api/creator/' + this.idCreator + '/miahoot/id/' + this.idMiahoot;
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
  sauvgarde(){
    this.router.navigate(['all-miahoot', this.idCreator]);
  }
}

