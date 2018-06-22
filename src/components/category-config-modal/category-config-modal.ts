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
  categoryName: string = "";
  categoryTargetAmount: number;
  groupName: string = "";
  title = "New Category";

  groupForm = null;
  categoryForm = null;
  submitted = false;
  action;
  object;

  constructor(
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public categoriesProvider: CategoriesProvider,
    public events: Events, public formBuilder: FormBuilder) {

    this.parentId = navParams.get('parentId');
    this.action = navParams.get('action');
    console.log(this.action);
    this.object = navParams.get('object');
    if (this.action == "ng") {
      this.title = "New Group";
    }
    else if(this.action == "ug"){
      this.groupName = this.object.name;
      this.title = "Edit Group";
    }
    else if(this.action == "uc"){
      this.title = "Edit Category";
      this.categoryTargetAmount = Number(this.object.targetAmount)/100;
      this.categoryName = this.object.name;
    }

    this.groupForm = formBuilder.group({
      groupName: ['', Validators.compose([Validators.required])]
    });

    this.categoryForm = formBuilder.group({
      categoryName: ['', Validators.compose([Validators.required])],
      amount: ['', Validators.compose([Validators.pattern("^\\d+(\\.\\d{2})?$"), Validators.required])],
    });
  }

  save() {

    this.submitted = true;

    if(!this.groupForm.valid && !this.categoryForm.valid){
      return;
    }

    if(this.action == "ug"){
      this.object.name = this.groupName;
      this.categoriesProvider.updateGroup(this.object).then(
        () => {
          this.viewCtrl.dismiss();
        });
    }

    else if(this.action == "uc"){
      this.object.name = this.categoryName;
      this.object.targetAmount = this.categoryTargetAmount;
      this.categoriesProvider.updateCategory(this.object).then(
        () => {
          this.viewCtrl.dismiss();
        });
    }

    else if (this.action == "ng") {
      this.categoriesProvider.addGroup(this.groupName).then(
        () => {
          this.viewCtrl.dismiss();
        });
    }

    else {
      this.categoriesProvider.addCategory(this.categoryName, 0, this.categoryTargetAmount, this.parentId).then(
        () => {
          this.viewCtrl.dismiss();
        });
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
