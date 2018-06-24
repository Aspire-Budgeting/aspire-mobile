import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { ViewController, ActionSheetController, NavParams, Events } from 'ionic-angular';
import { CategoriesProvider } from '../../providers/categories/categories';
import { CategoryConfigModalComponent } from '../../components/category-config-modal/category-config-modal';
import { MoneyProvider } from '../../providers/money/money';
import { TransactionsProvider } from '../../providers/transactions/transactions';

@Component({
  selector: 'page-categories',
  templateUrl: 'categories.html',
})
export class CategoriesPage {
  categoriesContainer: any = [];

  constructor(
    public viewCtrl: ViewController,
    public alertCtrl: ActionSheetController,
    public navParams: NavParams,
    public categoriesProvider: CategoriesProvider,
    public events: Events,
    public modalCtrl: ModalController,
    public moneyProvider: MoneyProvider,
    public transactionProvider: TransactionsProvider) {
    this.refreshCategoryList();
  }

  refreshCategoryList() {
    this.categoriesProvider.getCategoriesContruct().then(
      result => { this.categoriesContainer = result }
    )
  }

  createNewCategory(parentId) {
    let modal = this.modalCtrl.create(CategoryConfigModalComponent,
      {
        parentId: parentId,
        action: "nc",
      });
    modal.present();
    modal.onDidDismiss(
      () => {
        this.refreshCategoryList();
        this.events.publish('categories:changed');
      }
    )
  }

  createNewGroup() {
    let modal = this.modalCtrl.create(CategoryConfigModalComponent,
      {
        action: "ng",
      });
    modal.present();
    modal.onDidDismiss(
      () => {
        this.refreshCategoryList();
        this.events.publish('categories:changed');
      }
    )
  }

  updateDetails(action, object, slidingItem) {
    setTimeout(() => slidingItem.close(), 500);
    let modal = this.modalCtrl.create(CategoryConfigModalComponent,
      {
        object: object,
        action: action,
      });
    modal.present();
    modal.onDidDismiss(
      () => {
        this.refreshCategoryList();
        this.events.publish('categories:changed');
      }
    )
  }

  deleteGroup(id) {

    let alert = this.alertCtrl.create({
      title: 'Removing this Group will also remove all the Categories it contains. Funds held in each deleted Category will return to Available to Budget. If a Category has a negative balance, this amount will be deducted from Available to Budget.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Remove Group',
          role: 'destructive',
          handler: () => {

            this.moneyProvider.getAvailableToBudget().then(
              (atob) => {
                return this.categoriesProvider.getChildCategoriesOfParent(id).then(
                  (categoriesToDelete) => {
                    let transactions = [];

                    transactions.push(this.categoriesProvider.deleteGroup(id));

                    categoriesToDelete.forEach((category) => {
                      let newTransactionData = {
                        name: "Deleting category: " + name,
                        status: "Cleared",
                        date: this.transactionProvider.getNewDate(),
                        amount: Number(category.amount) / 100,
                        direction: null,
                        visible: false,
                        sourceCatId: category._id, //{ sourceCatId: category._id, sourceCatName: null },
                        sourceAcctId: null, //{ sourceAcctId: null, sourceAcctName: null },
                        destCatId: atob._id, //{ destCatId: atob._id, destCatName: null },
                        destAcctId: null, //{ destAcctId: null, destAcctName: null },
                      };

                      transactions.push(this.transactionProvider.addTransaction(newTransactionData).then(
                        () => { return this.categoriesProvider.deleteCategory(category._id) }
                      ))
                    });

                    Promise.all(transactions).then(
                      () => {
                        return this.moneyProvider.getCategoryTotal(atob._id).then(
                          (catTotal) => {
                            return this.categoriesProvider.updateCategoryAmount(atob._id, catTotal).then(
                              () => {
                                this.refreshCategoryList();
                                this.events.publish('categories:changed');
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

  deleteCategory(id, name, amount) {

    let alert = this.alertCtrl.create({
      title: 'Funds held in this Category will return to Available to Budget. If this Category has a negative balance, this amount will be deducted from Available to Budget.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Remove Category',
          role: 'destructive',
          handler: () => {

            this.moneyProvider.getAvailableToBudget().then(
              (atob) => {
                return this.moneyProvider.getCategoryTotal(id).then(

                  (catTotal) => {
                    let newTransactionData = {
                      name: "Deleting category: " + name,
                      status: "Cleared",
                      date: this.transactionProvider.getNewDate(),
                      amount: Number(amount) / 100,
                      direction: null,
                      visible: false,
                      sourceCatId: id, //{ sourceCatId: id, sourceCatName: null },
                      sourceAcctId: null, //{ sourceAcctId: null, sourceAcctName: null },
                      destCatId: atob._id, //{ destCatId: atob._id, destCatName: null },
                      destAcctId: null, //{ destAcctId: null, destAcctName: null },
                    };

                    return this.transactionProvider.addTransaction(newTransactionData).then(
                      () => {
                        return this.moneyProvider.getCategoryTotal(atob._id).then(
                          (catTotal) => {
                            return this.categoriesProvider.updateCategoryAmount(atob._id, catTotal).then(
                              () => {
                                return this.categoriesProvider.deleteCategory(id).then(
                                  () => {
                                    this.refreshCategoryList();
                                    this.events.publish('categories:changed');
                                  });
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
}
