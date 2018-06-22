import { Component } from '@angular/core';
import { ModalController, AlertController, ActionSheetController } from 'ionic-angular';
import { AccountModalComponent } from '../../components/account-modal/account-modal';
import { AccountsProvider } from '../../providers/accounts/accounts';
import { Events } from 'ionic-angular';
import { SorterProvider } from '../../providers/sorter/sorter';
import { TransactionsProvider } from '../../providers/transactions/transactions';
import { CategoriesProvider } from '../../providers/categories/categories';
import { MoneyProvider } from '../../providers/money/money';

@Component({
  selector: 'page-accounts',
  templateUrl: 'accounts.html'
})
export class AccountsPage {

  accounts: any = [];

  constructor(public modalCtrl: ModalController, public alertDialogCtrl: AlertController, public alertCtrl: ActionSheetController, public accountsProvider: AccountsProvider,
    public events: Events, public sorter: SorterProvider, public transactionsProvider: TransactionsProvider, public categoriesProvider: CategoriesProvider,
    public moneyProvider: MoneyProvider) {
    this.refreshAccounts();
    events.subscribe('transaction:saved', () => { this.refreshAccounts(); });
    events.subscribe('account:added', () => { this.refreshAccounts(); });
    events.subscribe('account:deleted', () => { this.refreshAccounts(); });
    events.subscribe('transaction:deleted', () => {
      this.refreshAccounts()
    });

  }

  refreshAccounts() {
    this.accountsProvider.getAccounts().then(
      (result) => {
        result.sort(this.sorter.sortByName);
        this.accounts = result;
      });
  }

  openModal() {
    let modal = this.modalCtrl.create(AccountModalComponent);
    modal.present();
  }

  getIcon(account) {
    if (account.type == "m") return "md-cash";
    else if (account.type == "c") return "md-card";
    else if (account.type == "b") return "md-home";
  }

  present(account) {
    let actionSheet = this.alertCtrl.create({
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {

            let alert = this.alertDialogCtrl.create({
              title: 'Delete Account?',
              message: "Your Available to Budget amount will be updated to reflect this account being removed.",
              buttons: [
                {
                  text: 'Cancel',
                  role: 'cancel',
                  handler: () => {
                    console.log('Cancel clicked');
                  }
                },
                {
                  text: 'Delete',
                  role: 'destructive',
                  handler: () => {
                    this.accountsProvider.deleteAccount(account._id).then(() => {
                      return this.moneyProvider.getAvailableToBudget().then(
                        (atob) => {
                          let newTransactionData = {
                            name: "Closing account: " + account.name,
                            status: "Cleared",
                            date: this.transactionsProvider.getNewDate(),
                            amount: Number(account.amount) / 100,
                            direction: null,
                            visible: false,
                            sourceCatId: null, //{ sourceCatId: null, sourceCatName: null },
                            sourceAcctId: null, //{ sourceAcctId: null, sourceAcctName: null },
                            destCatId: null, //{ destCatId: null, destCatName: null },
                            destAcctId: null, //{ destAcctId: null, destAcctName: null },
                          }

                          if (account.amount >= 0) {
                            newTransactionData.direction = "Outflow";
                            newTransactionData.sourceCatId = atob._id;
                          } else if (account.amount < 0) {
                            newTransactionData.amount *= -1;
                            newTransactionData.direction = "Inflow";
                            newTransactionData.destCatId = atob._id;
                          }

                          return this.transactionsProvider.addTransaction(newTransactionData).then(
                            () => {
                              return this.moneyProvider.getCategoryTotal(atob._id).then(
                                (catTotal) => {
                                  return this.moneyProvider.updateCategoryAmount(atob._id, catTotal).then(
                                    () => {
                                      this.events.publish('account:deleted');
                                    });
                                });
                            });
                        });
                    });
                  }
                }
              ]
            });
            alert.present();
          }
        },
        {
          text: 'Change Name',
          handler: () => {
            let modal = this.modalCtrl.create(AccountModalComponent,
              {
                account: account,
                new: false,
              });
            modal.present();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel', // will always sort to be on the bottom
          handler: () => { }
        }
      ]
    });

    actionSheet.present();
  }
}
