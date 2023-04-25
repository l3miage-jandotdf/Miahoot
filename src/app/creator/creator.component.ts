import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.css']
})
export class CreatorComponent {
  question !: string;
  answers ! : string[];
  correctAnswer !: number;


  constructor(private http: HttpClient) {}

  submitMiahoot(): void {
    const data = {
      question: this.question,
      answers: this.answers,
      correctAnswer: this.correctAnswer
    };
    this.createMiahoot(data).subscribe(
      () => {
        console.log('Miahoot created successfully!');
      },
      (error) => {
        console.log(`Failed to create Miahoot: ${error}`);
      }
    );
  }

  private createMiahoot(data: any): Observable<any> {
    const url = 'url du backend';
    return this.http.post(url, data);
  }
}
