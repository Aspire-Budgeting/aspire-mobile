import { Component, ViewChild } from '@angular/core';
import { ItemSliding, Content } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { MoveMoneyModalComponent } from '../../components/move-money-modal/move-money-modal';
import { CategoriesProvider } from '../../providers/categories/categories';
import { TransactionsProvider } from '../../providers/transactions/transactions';
import { MoneyProvider } from '../../providers/money/money';
import { Events } from 'ionic-angular';

@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html'
})
export class DashboardPage {
  @ViewChild('content') content: Content;

  categoriesContainer = [];
  showHUD: boolean = false;
  availableToBudget: any = [];
  columnSetting: string = "AVAILABLE";
  pendingTransactions: number = 0;
  daysLeftInMonth: number = 0;

  constructor(public modalCtrl: ModalController, public categoriesProvider: CategoriesProvider,
    public moneyProvider: MoneyProvider, public events: Events, public transactionsProvider: TransactionsProvider) {

    events.subscribe('dashboard:moneymoved', () => { this.refreshDashboard() });
    events.subscribe('transaction:saved', () => { this.refreshDashboard() });
    events.subscribe('account:added', () => { this.refreshDashboard() });
    events.subscribe('categories:changed', () => { this.refreshDashboard() });
    events.subscribe('account:deleted', () => { this.refreshDashboard() });
    events.subscribe('transaction:deleted', () => { this.refreshDashboard() });

    this.refreshDashboard();

  }

  getDaysLeftInMonth() {
    let date = new Date();
    this.daysLeftInMonth = 1 + new Date(date.getFullYear(), date.getMonth(), 0).getDate() - date.getDate();
  };

  toggleHUD() {
    this.showHUD = !this.showHUD;
    this.content.resize();
  }

  getCategorySpentAmount(categoryId) {
    return this.categoriesProvider.getTotalSpentThisMonthForCategory(categoryId);
  }

  slideItem(slidingItem: ItemSliding, direction, category) {
    setTimeout(() => slidingItem.close(), 500);
    let modal = this.modalCtrl.create(MoveMoneyModalComponent,
      {
        moneyDirection: direction,
        category: category,
        availableToBudget: this.availableToBudget,
      });
    modal.present();
  }

  refreshDashboard() {

    this.getDaysLeftInMonth()

    this.transactionsProvider.getNumberOfPendingTransactions().then(
      (result) => { this.pendingTransactions = result }
    )

    this.categoriesProvider.getCategoriesContruct().then(
      result => {
        this.categoriesContainer = result;

        for (let i = 0; i < this.categoriesContainer.length; i++) {
          for (let j = 0; j < this.categoriesContainer[i]['categories'].length; j++) {
            this.categoriesProvider.getTotalSpentThisMonthForCategory(this.categoriesContainer[i]['categories'][j]._id).then(
              (catSpentTotal) => {
                this.categoriesContainer[i]['categories'][j].spentAmount = catSpentTotal;
              });
          }
        }
      });

    this.moneyProvider.getAvailableToBudget().then(
      (result) => {
        this.availableToBudget = result;
        this.content.resize();
      });
  }
}

