import { Injectable } from '@angular/core';

@Injectable()
export class SorterProvider {

  constructor() {}

  sortByName(a, b) {
    var nameA = a.name.toUpperCase(); // ignore upper and lowercase
    var nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  };

  sortByDate(a, b) {
    var dateA = a.date;
    var dateB = b.date;
    if (dateA < dateB) {
      return 1;
    }
    if (dateA > dateB) {
      return -1;
    }
    return 0;
  };

}
