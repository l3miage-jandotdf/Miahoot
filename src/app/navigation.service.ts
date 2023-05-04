import { Injectable } from '@angular/core';


export class NavigationService {
  id : String | undefined;

  constructor() {
    console.log("dans le service id = ",this.id)
   }
}
