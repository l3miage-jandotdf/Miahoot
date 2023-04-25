import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question } from './question';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  private apiUrl = 'http://localhost:3000/questions';

  constructor(private http: HttpClient) { }

  getQuestion(id: string): Observable<Question> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Question>(url);
  }

  updateQuestion(question: Question): Observable<any> {
    const url = `${this.apiUrl}/${question.id}`;
    return this.http.put(url, question);
  }

  deleteQuestion(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url);
  }
}
