import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class NavigationService {
  private idsubject = new BehaviorSubject<string>('');
  public id$ = this.idsubject.asObservable();

  setId(value : string){
    this.idsubject.next(value);
  }
}
