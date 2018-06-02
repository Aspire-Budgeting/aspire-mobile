import { DatabaseProvider } from '../database/database';
import { Injectable } from '@angular/core';

/*
  Generated class for the TransactionsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class TransactionsProvider {

  constructor(public database: DatabaseProvider) { }

  addTransaction(transaction) {
    return this.database.addTransaction(transaction);
  }

  getPendingTransactions() {
    return this.database.getPendingTransactions();
  }

  getNumberOfPendingTransactions() {
    return this.getPendingTransactions().then(
      result => { return result.length }
    )
  }

  getClearedTransactions() {
    return this.database.getClearedTransactions();
  }

  clearTransaction(id) {
    return this.database.clearTransaction(id);
  }

  deleteTransaction(id) {
    return this.database.deleteTransaction(id);
  }

  getTransaction(id) {
    return this.database.getTransaction(id);
  }

  filterTransactions(text) {
    return this.database.filterTransactions(text);
  }

  updateTransaction(transaction) {
    return this.database.updateTransaction(transaction);
  }
}