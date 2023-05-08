import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class NavigationService {
  private idsubject = new BehaviorSubject<string>('');
  public id$ = this.idsubject.asObservable();

  private pseudoParticipant = new BehaviorSubject<string>('');
  public pseudo$ = this.pseudoParticipant.asObservable();

  setId(value : string){
    this.idsubject.next(value);
  }

  setPseudo(value : string){
    this.pseudoParticipant.next(value);
  }
}
