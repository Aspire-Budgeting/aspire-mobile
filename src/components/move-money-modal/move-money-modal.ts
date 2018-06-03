import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { MoneyProvider } from '../../providers/money/money';
import { Events } from 'ionic-angular';
import { TransactionsProvider } from '../../providers/transactions/transactions';
import { CategoriesProvider } from '../../providers/categories/categories';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'move-money-modal',
  templateUrl: 'move-money-modal.html'
})
export class MoveMoneyModalComponent {

  private moveMoneyForm: FormGroup;

  atobCalc: string = "-";
  targetCatCalc: string = "+";
  atobAmount: number = null;
  targetCatAmount: number = null;

  currentAtob: any = [];
  currentTargetCatAmount: number = null;
  currentCatName: string = null;
  currentCatId: string = null;

  newTransactionData = { // every transaction should have the following attributes
    name: "",
    status: "Cleared",
    date: null,
    amount: null,
    direction: "Transfer",
    visible: false,
    sourceCatId: null, //{ sourceCatId: null, sourceCatName: null },
    sourceAcctId: null, //{ sourceAcctId: null, sourceAcctName: null },
    destCatId: null, //{ destCatId: null, destCatName: null },
    destAcctId: null, //{ destAcctId: null, destAcctName: null },
  }

  sourceCatName = null;
  destCatNAme = null;

  constructor(public viewCtrl: ViewController, public navParams: NavParams, public categoriesProvider: CategoriesProvider,
    public moneyProvider: MoneyProvider, public events: Events, public transactionProvider: TransactionsProvider, private formBuilder: FormBuilder) {

    /*this.moveMoneyForm = this.formBuilder.group({
      amount: [Validators.required]//, forbiddenNameValidator(/bob/i) ^-?\d+(\.\d{2})?$],
    });*/

    this.newTransactionData.direction = navParams.get('moneyDirection');
    this.currentAtob = navParams.get('availableToBudget');
    this.currentTargetCatAmount = navParams.get('category').amount;
    this.currentCatName = navParams.get('category').name;
    this.currentCatId = navParams.get('category')._id;

    if (this.newTransactionData.direction === "into") {
      this.targetCatCalc = "+";
      this.atobCalc = "-";
      this.newTransactionData.destCatId = this.currentCatId
      this.destCatNAme = this.currentCatName;
      this.newTransactionData.sourceCatId = this.currentAtob._id;
      this.sourceCatName = this.currentAtob.name;
    } else if (this.newTransactionData.direction === "from") { // from
      this.targetCatCalc = "-";
      this.atobCalc = "+";
      this.newTransactionData.sourceCatId = this.currentCatId;
      this.sourceCatName = this.currentCatName;
      this.newTransactionData.destCatId = this.currentAtob._id;
      this.destCatNAme = this.currentAtob.name;
    }

    this.newTransactionData.name = "Move from " + this.sourceCatName + " to " + this.destCatNAme;

  }

  moveMoneyOut() {
    this.targetCatCalc = "-";
    this.atobCalc = "+";
    this.calculateSums();
    this.newTransactionData.sourceCatId = this.currentCatId;
    this.sourceCatName = this.currentCatName;
    this.newTransactionData.destCatId = this.currentAtob._id;
    this.destCatNAme = this.currentAtob.name;
  }

  moveMoneyIn() {
    this.targetCatCalc = "+";
    this.atobCalc = "-";
    this.calculateSums();
    this.newTransactionData.destCatId = this.currentCatId
    this.destCatNAme = this.currentCatName;
    this.newTransactionData.sourceCatId = this.currentAtob._id;
    this.sourceCatName = this.currentAtob.name;
  }

  calculateSums() {
    this.targetCatAmount = (this.targetCatCalc === "+") ? Number(this.currentTargetCatAmount) + 100 * Number(this.newTransactionData.amount) : Number(this.currentTargetCatAmount) - 100 * Number(this.newTransactionData.amount);
    this.atobAmount = (this.atobCalc === "+") ? Number(this.currentAtob.amount) + 100 * Number(this.newTransactionData.amount) : Number(this.currentAtob.amount) - 100 * Number(this.newTransactionData.amount);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  save() {

    let promiseStructure = this.transactionProvider.addTransaction(this.newTransactionData).then(
      (result) => {
        return this.moneyProvider.getCategoryTotal(this.newTransactionData.destCatId).then(
          (catTotal1) => {
            return this.moneyProvider.updateCategoryAmount(this.newTransactionData.destCatId, catTotal1).then(
              () => {
                return this.moneyProvider.getCategoryTotal(this.newTransactionData.sourceCatId).then(
                  (catTotal2) => {
                    return this.moneyProvider.updateCategoryAmount(this.newTransactionData.sourceCatId, catTotal2);
                  });
              });
          });
      })

    Promise.all([promiseStructure]).then(
      result => {
        this.events.publish('dashboard:moneymoved');
        this.viewCtrl.dismiss();
      });
  }
}
