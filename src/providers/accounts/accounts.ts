import { Injectable } from '@angular/core';
import { DatabaseProvider } from '../database/database';
import { MoneyProvider } from '../money/money';

@Injectable()
export class AccountsProvider {

  constructor(public database: DatabaseProvider, public moneyProvider: MoneyProvider) {

  }

  addAccount(account) {
    return this.database.addAccount(account);
  }

  getAccounts() {
    return this.database.getAccounts();
  }

  deleteAccount(uuid) {
    return this.database.deleteAccount(uuid);
  }

  updateAccountAmount(id, amount) {
    return this.database.updateAccountAmount(id, amount);
  }

  updateAccount(account) {
    return this.database.updateAccount(account);
  }

  refreshAllAccounts() {
    return this.getAccounts().then(
      accounts => {
        let allPromises = [];
        accounts.forEach(account => {
          allPromises.push(this.moneyProvider.getAccountTotal(account._id).then(
            amount => {
              return this.updateAccountAmount(account._id, amount);
            }));
        });
        let promise = Promise.all(allPromises);
        return promise;
      });
  }
}
