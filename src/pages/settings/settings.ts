import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { CategoryConfigModalComponent } from '../../components/category-config-modal/category-config-modal';
import { CategoriesProvider } from '../../providers/categories/categories';
import { CategoriesPage } from '../categories/categories';
import { InAppBrowser } from '@ionic-native/in-app-browser';


@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  categories = [];

  constructor(public iab: InAppBrowser, public navController: NavController, public modalCtrl: ModalController, public categoriesProvider: CategoriesProvider) {
  }

  openCategoryConfigModal() {
    let modal = this.modalCtrl.create(CategoryConfigModalComponent, {categories: this.categories});
    modal.present();
  }

  goToCategoriesPage(){
    this.navController.push(CategoriesPage);
  }

  openThanksTo(){
    let browser = this.iab.create('http://aspirebudget.com/acknowledge.html', '_blank', 'location=yes');
    browser.show();
  }

  openPrivacyPolicy(){
    let browser = this.iab.create('http://aspirebudget.com/privacy.html', '_blank', 'location=yes');
    browser.show();
  }
  
  openTwitter(){
    let browser = this.iab.create('https://twitter.com/aspirebudget', '_blank', 'location=yes');
    browser.show();
  }

  openReddit(){
    let browser = this.iab.create('https://www.reddit.com/r/aspirebudgeting', '_blank', 'location=yes');
    browser.show();
  }

  openWebsite(){
    let browser = this.iab.create('http://aspirebudget.com/', '_blank', 'location=yes');
    browser.show();
  }

}
