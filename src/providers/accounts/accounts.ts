import { Injectable } from '@angular/core';
import { DatabaseProvider } from '../database/database';
import { MoneyProvider } from '../money/money';

@Injectable()
export class AccountsProvider {

  cardColors = [
    'card-color1',
    'card-color2',
    'card-color3',
    'card-color4',
    'card-color5',
    'card-color6',
  ];

  cardBackgrounds = [
    'card-background1',
    'card-background2',
    'card-background3',
    'card-background4',
    'card-background5',
  ];

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

  getCardClass(): string {
    let classString = 'account-card ';
    classString += this.cardColors[this.random(this.cardColors.length)];
    classString += ' ';
    classString += this.cardBackgrounds[this.random(this.cardBackgrounds.length)];
    return classString;
  }

  random(cap): number {
    return Math.floor(Math.random() * cap);
  }
}
