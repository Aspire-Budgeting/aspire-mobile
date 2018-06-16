import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { TransactionsPage } from '../pages/transactions/transactions';
import { AccountsPage } from '../pages/accounts/accounts';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { SettingsPage } from '../pages/settings/settings';
import { CategoriesPage } from '../pages/categories/categories';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TransactionModalComponent } from '../components/transaction-modal/transaction-modal';
import { MoveMoneyModalComponent } from '../components/move-money-modal/move-money-modal';
import { AccountModalComponent } from '../components/account-modal/account-modal';
import { CategoryConfigModalComponent } from '../components/category-config-modal/category-config-modal';
import { AccountsProvider } from '../providers/accounts/accounts';
import { CategoriesProvider } from '../providers/categories/categories';
import { DatabaseProvider } from '../providers/database/database';
import { TransactionsProvider } from '../providers/transactions/transactions';
import { MoneyProvider } from '../providers/money/money';
import { SorterProvider } from '../providers/sorter/sorter';

import { InAppBrowser } from '@ionic-native/in-app-browser';


@NgModule({
  declarations: [
    MyApp,
    TransactionsPage,
    AccountsPage,
    DashboardPage,
    SettingsPage,
    CategoriesPage,
    TabsPage,
    TransactionModalComponent,
    MoveMoneyModalComponent,
    AccountModalComponent,
    CategoryConfigModalComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      tabsHideOnSubPages: true,
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TransactionsPage,
    AccountsPage,
    DashboardPage,
    SettingsPage,
    CategoriesPage,
    TabsPage,
    TransactionModalComponent,
    MoveMoneyModalComponent,
    AccountModalComponent,
    CategoryConfigModalComponent
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    AccountsProvider,
    CategoriesProvider,
    DatabaseProvider,
    TransactionsProvider,
    MoneyProvider,
    SorterProvider,
    InAppBrowser,
  ]
})
export class AppModule { }
