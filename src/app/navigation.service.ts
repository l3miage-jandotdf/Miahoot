import { Injectable } from '@angular/core';
import { User, UserInfo } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { getAuth } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})

export class NavigationService {

  private userSubject !: BehaviorSubject<User >;
  public user!: User;

  private idsubject = new BehaviorSubject<string>('');
  public id$ = this.idsubject.asObservable();

  private logSubject = new BehaviorSubject<boolean>(false);
  public log$ = this.logSubject.asObservable();

  private logWithGoogleSubject = new BehaviorSubject<boolean>(false);
  public logWithGoogle$ = this.logWithGoogleSubject.asObservable();

  constructor(){
    const auth = getAuth().currentUser;
    if(auth!=null){
    this.userSubject = new BehaviorSubject<User>(auth);
    this.userSubject.subscribe(user => {
      this.user = user
    })
    }
  }

  setId(value : string){
    this.idsubject.next(value);
  }

  setUser(user : User){
    this.userSubject.next(user);
  }

  setLog(value : boolean){
    this.logSubject.next(value);
  }

  setLogWithGoogle(value : boolean){
    this.logWithGoogleSubject.next(value);
  }

}
