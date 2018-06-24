import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { TransactionsProvider } from '../../providers/transactions/transactions';
import { CategoriesProvider } from '../../providers/categories/categories';
import { AccountsProvider } from '../../providers/accounts/accounts';
import { MoneyProvider } from '../../providers/money/money';
import { Events } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'transaction-modal',
  templateUrl: 'transaction-modal.html'
})
export class TransactionModalComponent {

  //moneyDirection: string;
  //originalTransactionAmount: number = 0;

  newTransactionData = { // every transaction should have the following attributes
    name: null,
    status: "Pending",
    date: null,
    amount: null,
    direction: "Outflow",
    visible: true,
    sourceCatId: null,
    sourceAcctId: null,
    destCatId: null,
    destAcctId: null,
    //sourceCat: { sourceCatId: null, sourceCatName: null },
    //sourceAcct: { sourceAcctId: null, sourceAcctName: null },
    //destCat: { destCatId: null, destCatName: null },
    //destAcct: { destAcctId: null, destAcctName: null },
  }

  action: string = "New Transaction";
  categories = [];
  accounts = [];

  submitted = false;
  commonForm = null;
  inflowForm = null;
  outflowForm = null;
  transferForm = null;


  constructor(public viewCtrl: ViewController, public transactionsProvider: TransactionsProvider,
    public categoriesProvider: CategoriesProvider, public accountsProvider: AccountsProvider, public navParams: NavParams,
    public events: Events, public moneyProvider: MoneyProvider, public formBuilder: FormBuilder) {

    this.commonForm = formBuilder.group({
      name: ['', Validators.compose([Validators.required])],
      amount: ['', Validators.compose([Validators.pattern("^\\d+(\\.\\d{2})?$"), Validators.required])],
      date: ['', Validators.compose([Validators.required])]
    });

    this.inflowForm = formBuilder.group({
      category: ['', Validators.compose([Validators.required])],
      account: ['', Validators.compose([Validators.required])]
    });

    this.outflowForm = formBuilder.group({
      category: ['', Validators.compose([Validators.required])],
      account: ['', Validators.compose([Validators.required])]
    });

    this.transferForm = formBuilder.group({
      source: ['', Validators.compose([Validators.required])],
      dest: ['', Validators.compose([Validators.required])]
    });

    let editTransaction = navParams.get('transaction');

    if (editTransaction) {
      Object.assign(this.newTransactionData, editTransaction);
      this.action = "Edit Transaction";
      this.newTransactionData.amount = Number(editTransaction.amount) / 100;
    }

    else {
      this.newTransactionData.date = this.transactionsProvider.getNewDate();
    }

    this.categoriesProvider.getAllCategories().then(
      result => { this.categories = result }
    )

    this.accountsProvider.getAccounts().then(
      result => { this.accounts = result }
    )
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  save() {

    this.submitted = true;

    if (this.newTransactionData.direction === "Transfer" && this.transferForm.valid && this.commonForm.valid) {
      this.newTransactionData.status = "Cleared";
      this.newTransactionData.destCatId = null;
      this.newTransactionData.sourceCatId = null;
    }

    else if (this.newTransactionData.direction === "Inflow" && this.inflowForm.valid && this.commonForm.valid) {
      this.newTransactionData.sourceAcctId = null;
      this.newTransactionData.sourceCatId = null;
    }

    else if (this.newTransactionData.direction === "Outflow" && this.outflowForm.valid && this.commonForm.valid) {
      this.newTransactionData.destAcctId = null;
      this.newTransactionData.destCatId = null;
    }

    else{
      return;
    }

    let transactionPromise = null;

    if (this.action === "New Transaction") {
      transactionPromise = this.transactionsProvider.addTransaction(this.newTransactionData);
    }
    else if (this.action === "Edit Transaction") {
      transactionPromise = this.transactionsProvider.updateTransaction(this.newTransactionData);
    }

    Promise.all([transactionPromise]).then(
      () => {

        let promiseStructure = [];

        promiseStructure.push(this.accountsProvider.refreshAllAccounts());
        promiseStructure.push(this.categoriesProvider.refreshAllCategories());

        /*if (this.newTransactionData.direction === "Outflow") {
          promiseStructure = this.moneyProvider.getCategoryTotal(this.newTransactionData.sourceCatId).then(
            (catTotal) => {
              return this.categoriesProvider.updateCategoryAmount(this.newTransactionData.sourceCatId, catTotal).then(
                () => {
                  return this.moneyProvider.getAccountTotal(this.newTransactionData.sourceAcctId).then(
                    (acctTotal) => {
                      return this.accountsProvider.updateAccountAmount(this.newTransactionData.sourceAcctId, acctTotal);
                    }
                  );
                }
              );
            }
          );
        }

        if (this.newTransactionData.direction === "Inflow") {
          promiseStructure = this.moneyProvider.getCategoryTotal(this.newTransactionData.destCatId).then(
            (catTotal) => {
              return this.categoriesProvider.updateCategoryAmount(this.newTransactionData.destCatId, catTotal).then(
                () => {
                  return this.moneyProvider.getAccountTotal(this.newTransactionData.destAcctId).then(
                    (acctTotal) => {
                      return this.accountsProvider.updateAccountAmount(this.newTransactionData.destAcctId, acctTotal);
                    }
                  );
                }
              );
            }
          );
        }

        if (this.newTransactionData.direction === "Transfer") {
          promiseStructure = this.moneyProvider.getAccountTotal(this.newTransactionData.sourceAcctId).then(
            (acctTotal1) => {
              return this.accountsProvider.updateAccountAmount(this.newTransactionData.sourceAcctId, acctTotal1).then(
                () => {
                  return this.moneyProvider.getAccountTotal(this.newTransactionData.destAcctId).then(
                    (acctTotal2) => {
                      return this.accountsProvider.updateAccountAmount(this.newTransactionData.destAcctId, acctTotal2);
                    }
                  );
                }
              );
            }
          );
        }*/

        Promise.all(promiseStructure).then(
          () => {
            this.events.publish('transaction:saved');
            this.viewCtrl.dismiss();
          });
      });
  }
}
