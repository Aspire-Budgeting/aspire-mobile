import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { ViewController, AlertController, NavParams, Events } from 'ionic-angular';
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
    public alertCtrl: AlertController,
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
        createGroup: true,
      });
    modal.present();
    modal.onDidDismiss(
      () => {
        this.refreshCategoryList();
        this.events.publish('categories:changed');
      }
    )
  }

  /*createNewGroup() {
    let alert = this.alertCtrl.create({
      title: 'New Category Group',
      message: 'Enter a name for this new category group you\'re adding.',
      inputs: [
        {
          name: 'name',
          placeholder: 'Name'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: () => { }
        },
        {
          text: 'Add',
          handler: (group) => {
            this.categoriesProvider.addGroup(group.name).then(
              result => {
                this.refreshCategoryList();
                this.events.publish('categories:changed');
              });
          }
        }
      ]
    });

    alert.present();
  }*/

  deleteGroup(id) {

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
                date: (new Date()).toISOString(),
                amount: category.amount,
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

  deleteCategory(id, name, amount) {

    this.moneyProvider.getAvailableToBudget().then(
      (atob) => {
        return this.moneyProvider.getCategoryTotal(id).then(

          (catTotal) => {
            let newTransactionData = {
              name: "Deleting category: " + name,
              status: "Cleared",
              date: (new Date()).toISOString(),
              amount: amount,
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
