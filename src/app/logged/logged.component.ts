import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable, map, of, switchMap } from 'rxjs';
import { MiahootUserConverter } from '../data.service';

@Component({
  selector: 'app-logged',
  templateUrl: './logged.component.html',
  styleUrls: ['./logged.component.scss'],
  changeDetection : ChangeDetectionStrategy.OnPush
})


export class LoggedComponent {
  //readonly obsProjectedMiahootID : Observable <string | undefined>;
  //readonly obsProjectedMiahoot : Observable<undefined | MiahootProjected>

  /*constructor(private auth : Auth, private fs : Firestore){
    this.obsProjectedMiahootID  = authState(auth).pipe(
      switchMap(U => {
        if(U == null){
          return of(undefined);
        }else{
          //
          const docUser = doc(fs, `users/${U.uid}`).withConverter(MiahootUserConverter);
          return docData(docUser).pipe(
            map(miahootUser => miahootUser.projectedMiahoot)
          )
        }
      })
    )

    this.obsProjectedMiahoot = this.obsProjectedMiahootID.pipe(
      switchMap(projectedMiahootID => {
        if(projectedMiahootID === undefined){
          return of(undefined);
        }else{
          const docProjectedMiahoot = doc(fs, `miahoot/${projectedMiahootID}`).withConverter(MiahootUserConverter)
        }
      }

    )
  }*/
}
