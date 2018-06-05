import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { AccountsProvider } from '../../providers/accounts/accounts';
import { TransactionsProvider } from '../../providers/transactions/transactions';
import { MoneyProvider } from '../../providers/money/money';
import { CategoriesProvider } from '../../providers/categories/categories';
import { Events } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'account-modal',
  templateUrl: 'account-modal.html'
})
export class AccountModalComponent {

  newTransactionData = { // every transaction should have the following attributes
    name: "New Account: ",
    status: "Cleared",
    date: null,
    amount: null,
    direction: null,
    visible: false,
    sourceCatId: null, //{ sourceCatId: null, sourceCatName: null },
    sourceAcctId: null, //{ sourceAcctId: null, sourceAcctName: null },
    destCatId: null, //{ destCatId: null, destCatName: null },
    destAcctId: null, //{ destAcctId: null, destAcctName: null },
  }

  accountData = {
    name: null,
    amount: 0,
    type: null,
    cardClass: this.accountProvider.getCardClass(),
  }

  form = null;
  submitted = false;

  constructor(public viewCtrl: ViewController, public accountProvider: AccountsProvider,
    public transactionProvider: TransactionsProvider, public moneyProvider: MoneyProvider,
    public categoryProvider: CategoriesProvider, public events: Events, public formBuilder: FormBuilder) {
    this.newTransactionData.date = (new Date()).toISOString();

    this.form = formBuilder.group({
      accountName: ['', Validators.compose([Validators.required])],
      currentAmount: ['', Validators.compose([Validators.pattern("^-?\\d+(\\.\\d{2})?$"), Validators.required])],
      accountType: ['', Validators.compose([Validators.required])],
    });
  }

  dismiss(): void {
    this.viewCtrl.dismiss();
  }

  save(): any {

    this.submitted = true;

    if(!this.form.valid){
      return;
    }

    let promiseStructure = this.accountProvider.addAccount(this.accountData).then(
      (account) => {
        return this.moneyProvider.getAvailableToBudget().then(
          (atob) => {

            this.newTransactionData.name += this.accountData.name;

            if (this.accountData.type === "b" || this.accountData.type === "m") {
              this.newTransactionData.direction = "Inflow";
              this.newTransactionData.destCatId = atob._id;
              this.newTransactionData.destAcctId = account.id;
            }
            else if (this.accountData.type === "c") {
              this.newTransactionData.direction = "Outflow";
              this.newTransactionData.sourceCatId = atob._id;
              this.newTransactionData.sourceAcctId = account.id;
            }
            return this.transactionProvider.addTransaction(this.newTransactionData).then(
              () => {
                return this.moneyProvider.getAccountTotal(account.id).then(
                  (acctTotal) => {
                    return this.accountProvider.updateAccountAmount(account.id, acctTotal).then(
                      () => {
                        return this.moneyProvider.getCategoryTotal(atob._id).then(
                          (catTotal) => {
                            return this.categoryProvider.updateCategoryAmount(atob._id, catTotal);
                          });
                      });
                  });
              });
          });
      }
    );

    Promise.all([promiseStructure]).then(
      () => {
        this.events.publish('account:added');
        this.viewCtrl.dismiss();
      }
    )
  }

}
