import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, from } from 'rxjs';

interface Answer {
  answer : String;
}

@Component({
  selector: 'app-creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatorComponent {
  question !: string;
  answers: Answer[] = [];

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


  addOption(): void {

    this.answers.push({answer:''});
  }

  removeOption(index: number): void {
    this.answers.splice(index, 1);
  }


}
