import { Component, ViewChild } from '@angular/core';
import { ModalController, NavController, Content, ItemSliding } from 'ionic-angular';
import { TransactionModalComponent } from '../../components/transaction-modal/transaction-modal';
import { TransactionsProvider } from '../../providers/transactions/transactions';
import { CategoriesProvider } from '../../providers/categories/categories';
import { Events } from 'ionic-angular';
import { SorterProvider } from '../../providers/sorter/sorter';
import { MoneyProvider } from '../../providers/money/money';
import { AccountsProvider } from '../../providers/accounts/accounts';

@Component({
  selector: 'page-transactions',
  templateUrl: 'transactions.html'
})
export class TransactionsPage {

  showSearchbar: boolean = false;
  noMoreTransactions: boolean = false;
  transactionIterator: number = 0;
  loadMoreCount: number = 25;
  pendingTransactions = [];
  clearedTransactions = [];
  allClearedTransactions = [];
  categories = [];
  accounts = [];
  filterItems = [];
  isFiltering = false;
  @ViewChild('content') content: Content;

  constructor(public navCtrl: NavController, public transactionsProvider: TransactionsProvider, public categoriesProvider: CategoriesProvider,
    public modalCtrl: ModalController, public events: Events, public sorter: SorterProvider, public moneyProvider: MoneyProvider,
    public accountsProvider: AccountsProvider) {
    events.subscribe('transaction:saved', () => {
      this.refreshTransactions();
    });

    this.refreshTransactions();
  }

  refreshTransactions() {
    this.transactionIterator = 0;
    this.clearedTransactions = [];

    this.accountsProvider.getAccounts().then(
      accounts => {
        this.accounts = accounts;

        this.categoriesProvider.getAllCategories().then(
          categories => {
            this.categories = categories;
            this.transactionsProvider.getPendingTransactions().then(
              result => {
                result.sort(this.sorter.sortByDate);
                this.pendingTransactions = result;

                for (let i = 0; i < this.pendingTransactions.length; i++) {
                  this.pendingTransactions[i].categoryName = this.getCategoryName(this.pendingTransactions[i].sourceCatId, this.pendingTransactions[i].destCatId);
                  this.pendingTransactions[i].accountName = this.getAccountName(this.pendingTransactions[i].sourceAcctId, this.pendingTransactions[i].destAcctId);
                }
              });

            this.transactionsProvider.getClearedTransactions().then(
              result => {
                result.sort(this.sorter.sortByDate);
                this.allClearedTransactions = result;
                for (let i = 0; i < this.allClearedTransactions.length; i++) {
                  this.allClearedTransactions[i].categoryName = this.getCategoryName(this.allClearedTransactions[i].sourceCatId, this.allClearedTransactions[i].destCatId);
                  this.allClearedTransactions[i].accountName = this.getAccountName(this.allClearedTransactions[i].sourceAcctId, this.allClearedTransactions[i].destAcctId);
                }

                for (let i = 0; i < this.loadMoreCount; i++) {
                  if (this.transactionIterator < this.allClearedTransactions.length) {
                    this.clearedTransactions.push(this.allClearedTransactions[this.transactionIterator]);
                  }
                  else {
                    this.noMoreTransactions = true;
                  }
                  this.transactionIterator++
                }
              });
          });
      });
  }

  doInfinite(): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        for (let i = 0; i < this.loadMoreCount; i++) {
          if (this.transactionIterator < this.allClearedTransactions.length) {
            this.clearedTransactions.push(this.allClearedTransactions[this.transactionIterator]);
          }
          else {
            this.noMoreTransactions = true;
          }
          this.transactionIterator++
        }
        resolve();
      }, 500);
    })
  }

  getAccountName(sourceId, destId) {
    let accountName = "";
    let endingString = ""
    if (destId) {
      for (let i = 0; i < this.accounts.length; i++) {
        if (this.accounts[i]._id === destId) {
          endingString = " to " + this.accounts[i].name;
        }
      }
    }

    for (let i = 0; i < this.accounts.length; i++) {
      if (this.accounts[i]._id === sourceId) {
        accountName = this.accounts[i].name + endingString
      }
    }

    if (accountName === "") {
      return "N/A";
    }
    else {
      return accountName;
    }
  }

  getCategoryName(sourceId, destId) {
    let id = "";
    if (sourceId) id = sourceId;
    else id = destId;

    for (let i = 0; i < this.categories.length; i++) {
      if (this.categories[i]._id === id) {
        return this.categories[i].name;
      }
    }
    return "N/A";
  }

  findItems(event: any) {
    this.filterItems = [];

    let text = event.target.value;
    this.isFiltering = true;

    if (text && text.trim() !== '') {
      this.transactionsProvider.filterTransactions(text).then(
        (result) => {
          this.filterItems = result;
          this.content.resize();
        }
      )
    }
  }

  closeSearchbar() {
    this.showSearchbar = !this.showSearchbar;
    this.isFiltering = false;
    this.content.resize();
  }

  clear(slidingItem: ItemSliding, id) {
    setTimeout(() => slidingItem.close(), 500);
    this.transactionsProvider.clearTransaction(id).then(
      result => { this.refreshTransactions(); }
    )
  }

  edit(slidingItem: ItemSliding, transaction) {
    setTimeout(() => slidingItem.close(), 500);

    let modal = this.modalCtrl.create(TransactionModalComponent,
      {
        transaction: transaction,
      });
    modal.present();
  }

  delete(slidingItem: ItemSliding, transactionId, sourceCatId, destCatId, sourceAcctId, destAcctId) {

    let promiseStructure = this.transactionsProvider.deleteTransaction(transactionId).then(
      () => {
        let transPromises = [];

        if (sourceCatId) {
          transPromises.push(this.moneyProvider.getCategoryTotal(sourceCatId).then(
            (catAmount) => {
              return this.categoriesProvider.updateCategoryAmount(sourceCatId, catAmount);
            }));
        }

        if (destCatId) {
          transPromises.push(this.moneyProvider.getCategoryTotal(destCatId).then(
            (catAmount) => {
              return this.categoriesProvider.updateCategoryAmount(destCatId, catAmount);
            }));
        }

        if (sourceAcctId) {
          transPromises.push(this.moneyProvider.getAccountTotal(sourceAcctId).then(
            (catAmount) => {
              return this.accountsProvider.updateAccountAmount(sourceAcctId, catAmount);
            }));
        }

        if (destAcctId) {
          transPromises.push(this.moneyProvider.getAccountTotal(destAcctId).then(
            (catAmount) => {
              return this.accountsProvider.updateAccountAmount(destAcctId, catAmount);
            }));
        }

        return Promise.all(transPromises);
      });

    promiseStructure.then(
      () => {
        this.refreshTransactions();
        this.events.publish('transaction:deleted');
        setTimeout(() => slidingItem.close(), 500);
      }
    )

  }

  /*edit(slidingItem: ItemSliding, transaction) {
    setTimeout(() => slidingItem.close(), 500);
    let modal = this.modalCtrl.create(TransactionModalComponent, { transaction: transaction });
    modal.present();
  }*/

}
