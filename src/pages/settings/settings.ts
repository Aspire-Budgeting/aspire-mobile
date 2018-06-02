import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { CategoryConfigModalComponent } from '../../components/category-config-modal/category-config-modal';
import { CategoriesProvider } from '../../providers/categories/categories';
import { CategoriesPage } from '../categories/categories';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  categories = [];

  constructor(public navController: NavController, public modalCtrl: ModalController, public categoriesProvider: CategoriesProvider) {
  }

  openCategoryConfigModal() {
    let modal = this.modalCtrl.create(CategoryConfigModalComponent, {categories: this.categories});
    modal.present();
  }

  goToCategoriesPage(){
    // push another page on to the navigation stack
    // causing the nav controller to transition to the new page
    // optional data can also be passed to the pushed page.
    this.navController.push(CategoriesPage);
  }
}
