import { Injectable } from '@angular/core';
import { DatabaseProvider } from '../../providers/database/database';

@Injectable()
export class MoneyProvider {

  constructor(public database: DatabaseProvider) { }

  getAvailableToBudget() {
    return this.database.getAvailableToBudget();
  }

  updateAvailableToBudget(atob) {
    return this.database.updateAvailableToBudget(atob);
  }

  updateCategoryAmount(categoryId, amount) {
    return this.database.updateCategoryAmount(categoryId, amount);
  }

  getCategoryTotal(id) {
    let inflowsPromise = this.database.getAllInflowsForCat(id);
    let outflowsPromise = this.database.getAllOutflowsForCat(id);

    return Promise.all([inflowsPromise, outflowsPromise]).then(
      result => {
        let inflows = result[0];
        let outflows = result[1];

        let sum = 0;

        for(let i = 0; i < inflows.length; i++){
          sum += inflows[i].amount;
        }

        for(let i = 0; i < outflows.length; i++){
          sum -= outflows[i].amount;
        }

        return sum;
      })
  }

  getAccountTotal(id) {
    let inflowsPromise = this.database.getAllInflowsForAccount(id);
    let outflowsPromise = this.database.getAllOutflowsForAccount(id);

    return Promise.all([inflowsPromise, outflowsPromise]).then(
      result => {
        let inflows = result[0];
        let outflows = result[1];

        let sum = 0;

        for(let i = 0; i < inflows.length; i++){
          sum += inflows[i].amount;
        }

        for(let i = 0; i < outflows.length; i++){
          sum -= outflows[i].amount;
        }

        return sum;
      });
  }

}
