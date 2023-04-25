import { Component, OnInit } from '@angular/core';

enum Role{
  Concepteur = "concepteur",
  Presentateur = "presentateur"
}

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})


export class RoleComponent implements OnInit{
  role : Role = Role.Concepteur;
  concepteur : boolean = true;


  updateRole() : void{
    if(this.role==Role.Concepteur){
      this.role=Role.Presentateur;
      this.concepteur=false;
    }
    else{
      this.role=Role.Concepteur;
      this.concepteur=true;
    }
  }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }


}
