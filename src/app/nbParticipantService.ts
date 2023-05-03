import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class nbParticipantService {
  public readyParticipants = new BehaviorSubject<number>(0);

  constructor() { }

  getReadyParticipants() {
    return this.readyParticipants.asObservable();
  }

  addReadyParticipant() {
    this.readyParticipants.next(this.readyParticipants.getValue() + 1);
  }
}