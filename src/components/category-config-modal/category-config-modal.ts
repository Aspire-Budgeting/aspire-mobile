import { Component } from '@angular/core';
import { ViewController, AlertController, NavParams, Events } from 'ionic-angular';
import { CategoriesProvider } from '../../providers/categories/categories';
import { FormBuilder, Validators } from '@angular/forms';

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
  title = "New Category";

  groupForm = null;
  categoryForm = null;
  submitted = false;

  constructor(
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public categoriesProvider: CategoriesProvider,
    public events: Events, public formBuilder: FormBuilder) {

    this.parentId = navParams.get('parentId');
    this.createGroup = navParams.get('createGroup');
    if (this.createGroup) {
      this.title = "New Group";
    }


    this.groupForm = formBuilder.group({
      groupName: ['', Validators.compose([Validators.required])]
    });

    this.categoryForm = formBuilder.group({
      categoryName: ['', Validators.compose([Validators.required])],
      amount: ['', Validators.compose([Validators.pattern("^-?\\d+(\\.\\d{2})?$"), Validators.required])],
    });
  }

  save() {

    this.submitted = true;

    if(!this.groupForm.valid && !this.categoryForm.valid){
      return;
    }

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
