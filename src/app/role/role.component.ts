import { Component, OnInit } from '@angular/core';

enum Role{
  Concepteur = "concepteur",
  Participant = "particpant"
}

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})


export class RoleComponent implements OnInit{
  role : Role = Role.Concepteur;
  concepteur : boolean = true;


  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }


}
