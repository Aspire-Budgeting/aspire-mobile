import { Component } from '@angular/core';
import { ViewController, AlertController, NavParams, Events } from 'ionic-angular';
import { CategoriesProvider } from '../../providers/categories/categories';

@Component({
  selector: 'category-config-modal',
  templateUrl: 'category-config-modal.html'
})
export class CategoryConfigModalComponent {

  parentId: string = "";
  createGroup: boolean = false;
  categoryName: string = "";
  categoryTargetAmount: string = "";
  groupName: string = "";

  constructor(
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public categoriesProvider: CategoriesProvider,
    public events: Events, ) {

    this.parentId = navParams.get('parentId');
    this.createGroup = navParams.get('createGroup');
  }

  save() {

    if (this.createGroup) {
      this.categoriesProvider.addGroup(this.groupName).then(
        result => {
          this.viewCtrl.dismiss();
        });
    }

    else {
      this.categoriesProvider.addCategory(this.categoryName, 0, this.categoryTargetAmount, this.parentId).then(
        result => {
          this.viewCtrl.dismiss();
        });
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
