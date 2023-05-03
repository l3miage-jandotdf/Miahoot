import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class nbParticipantService {
  private readyParticipants = new BehaviorSubject<number>(0);

  constructor() { }

  getReadyParticipants() {
    return this.readyParticipants.asObservable();
  }

  addReadyParticipant() {
    this.readyParticipants.next(this.readyParticipants.getValue() + 1);
  }
}