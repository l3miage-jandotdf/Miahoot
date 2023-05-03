import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DocumentSnapshot, Firestore, FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, doc, docData, getDoc } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of, switchMap } from 'rxjs';
import { setDoc } from 'firebase/firestore';
import { MatIconAnchor } from '@angular/material/button';


export interface MiahootUser {
  readonly name: string | null,
  readonly photoUrl: string | null
}

@Injectable({
  providedIn: 'root'
})

export class DataService {

  constructor(private auth: Auth, private fireStore: Firestore, private http: HttpClient) {
  }

  getMiahootUser$(): Observable<MiahootUser | undefined> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          // L'utilisateur est connecté

          let docQuelconque = doc(this.fireStore, `users/${user.uid}`);
          let refDocQuelconque = docQuelconque.withConverter(MiahootUserConverter);
          let obsDoc: Observable<MiahootUser> = docData(refDocQuelconque);
          let promesSnap: Promise<DocumentSnapshot<MiahootUser>> = getDoc(refDocQuelconque);
          promesSnap.then(snapshot => {
            if (!snapshot.exists()) {
              let utilisateurParDefaut: MiahootUser = { name: user.displayName, photoUrl: user.photoURL };
              setDoc(snapshot.ref, utilisateurParDefaut);
            }
          });
          return obsDoc;

        } else {
          // L'utilisateur n'est pas connecté
          return of(undefined);
        }
      })
    );
  }
  createCreator(creatorData: any): Observable<any> {
    return this.http.post('http://localhost:8080/api/creator/', creatorData);
  }

  checkIfCreatorExists(uid: string): Observable<boolean> {
    return this.http.get<boolean>(`/api/creator/check/${uid}`);
  }
}

export const MiahootUserConverter = {
  toFirestore(user: MiahootUser): MiahootUser {
    return user;
  },

  fromFirestore(snapshot: QueryDocumentSnapshot<MiahootUser>, options: SnapshotOptions): MiahootUser {
    const data = snapshot.data();
    const name = data?.name ?? '';
    const photoUrl = data?.photoUrl ?? '';
    return { name, photoUrl };
  }

}


/**
   * Structures de données pour les Miahoot projetés
   */

export interface MiahootProjected {
  readonly id: string;
  creator: string;
  presentator: string;
  currentMCQ: string;
  //QCMs : QcmProjected;

}

export type VOTES = {
  [participantUID: string]: true
}


export interface QcmProjected {
  question: string;
  responses: string[]; //réponses possibles
  votes: VOTES[]; //Autant d'entrée dans le tableau que de réponses possibles
}





/*export const FsMiahootProjectedConverter : FirestoreDataConverter<MiahootProjected> = {
  toFirestore : M => M,
  fromFirestore : snap => ({
    id : snap.id,
    creator : snap.get("creator"),
    presentator : snap.get("presentator"),
    currentQCM : snap.get("currentQCM")
  })
}*/




