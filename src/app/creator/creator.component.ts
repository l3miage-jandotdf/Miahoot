import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OnInit } from '@angular/core';

export interface Question {
  question: string;
  reponses: string[];
  reponseCorrecte: string;
}

@Component({
  selector: 'app-creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.scss']
})


export class CreatorComponent implements OnInit {

  questions ! : Question[];   //l'ensemble des questions-réponses du Miahoot

  constructor(private http: HttpClient) {}
  
  ngOnInit() {
    this.getQuestions().subscribe(questions => this.questions = questions);
  }
  
  getQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>('https://mon-backend.com/miahoot/questions');  //on récupère questions via les requêtes http depuis le backend
  }

  
  submitMiahoot() {
    const reponsesParticipant: { question: string; reponse: string[]; }[] = [];
    
    this.questions.forEach(q => {
      const reponseChoisie = document.querySelector(`input[name="${q.question}"]:checked`);
      //reponsesParticipant.push({ question: q.question, reponse: reponseChoisie? || 'N/A' });
    });
    
    this.http.post('https://mon-backend.com/miahoot/create', reponsesParticipant).subscribe(() => {
      // Ici, on peut peut-être afficher un message de confirmation de l'utilisateur
    });
  }
  
}
