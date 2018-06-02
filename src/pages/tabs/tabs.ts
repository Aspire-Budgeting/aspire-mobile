import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { TransactionModalComponent } from '../../components/transaction-modal/transaction-modal';

import { TransactionsPage } from '../transactions/transactions';
import { AccountsPage } from '../accounts/accounts';
import { DashboardPage } from '../dashboard/dashboard';
import { SettingsPage } from '../settings/settings';

@Component({
  selector: 'tab-bar',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  tab1Root = DashboardPage;
  tab2Root = TransactionsPage;
  tab3Root = AccountsPage;
  tab4Root = SettingsPage;

  constructor(public modalCtrl: ModalController) {}

  openModal() {
    let modal = this.modalCtrl.create(TransactionModalComponent);
    modal.present();
  }
}
