import { ChangeDetectionStrategy, Component } from '@angular/core';
import { switchMap } from 'rxjs';
import { MiahootUser, MiahootUserConverter } from '../data.service';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc } from '@angular/fire/firestore';
import { updateDoc } from 'firebase/firestore';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-account-config',
  templateUrl: './account-config.component.html',
  styleUrls: ['./account-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountConfigComponent {
  nouveauNom : string = "";
  fg? : FormGroup<{
    name:      FormControl<string>,
    photoURL:  FormControl<string>
    photoFile: FormControl<File | undefined>
  }>;
  constructor(private auth : Auth, private fireStore : Firestore){}

  


  updateName(newName: string): Promise<unknown> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          // L'utilisateur est connecté
          let docRef = doc(this.fireStore, `users/${user.uid}`).withConverter(MiahootUserConverter);
          return updateDoc(docRef,{ name: newName });
        } else {
          // L'utilisateur n'est pas connecté
          return Promise.reject(new Error('User not logged in'));
        }
      })
    ).toPromise();
  }
  /*
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const path = `users/${this.userId}/profile-picture/${file.name}`;
    const task = this.storage.upload(path, file);
    // TODO: update user profile picture URL in Firestore
  }
  */
}
