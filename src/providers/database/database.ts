import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchdbFind from 'pouchdb-find';

@Injectable()
export class DatabaseProvider {

  private _db;

  constructor() {
    PouchDB.plugin(PouchdbFind);
  }

  init() {
    this._db = new PouchDB('data', { auto_compaction: true });
  }

  // MONEY #######################################
  getAvailableToBudget() {
    return this._db.find({
      selector: { item: 'category', userDefined: false }
    }).then(result => {
      if (result.docs.length == 0) {
        return this._db.post({
          item: 'category',
          amount: 0,
          name: "Available to budget",
          userDefined: false,
        }).then(response => {
          return this._db.find({
            selector: { item: 'category', userDefined: false }
          }).then(result => {
            return result.docs[0];
          }).catch(err => {
            console.log(err);
          });
        }).catch(err => {
          console.log(err);
        });
      }
      return result.docs[0];
    }).catch(err => {
      console.log(err);
    });
  }

  updateAvailableToBudget(budget) {
    return this._db.put(budget)
      .then(result => { console.log(result) })
      .catch(err => { console.log(err) })
  }

  // TRANSACTIONS #######################################
  addTransaction(transaction) {
    return this._db.post({
      item: 'transaction',
      name: transaction.name,
      amount: 100 * Number(transaction.amount),
      sourceCatId: transaction.sourceCatId,
      sourceAcctId: transaction.sourceAcctId,
      destCatId: transaction.destCatId,
      destAcctId: transaction.destAcctId,
      status: transaction.status,
      date: transaction.date,
      direction: transaction.direction,
      visible: transaction.visible,
    }).then(function (response) {
      console.log(response);
    }).catch(function (err) {
      console.log(err);
    });
  }

  getAllInflowsForCat(id) {
    return this._db.find({
      selector: { item: 'transaction', destCatId: id }
    }).then(function (result) {
      return result.docs;
    }).catch(function (err) {
      console.log(err);
    });
  }

  getAllOutflowsForCat(id) {
    return this._db.find({
      selector: { item: 'transaction', sourceCatId: id }
    }).then(function (result) {
      return result.docs;
    }).catch(function (err) {
      console.log(err);
    });
  }

  filterTransactions(text) {

    var regexp = new RegExp(text, 'i');

    console.log(text);
    return this._db.find({
      selector: {
        item: 'transaction',
        name: { $regex: regexp },
        visible: true,
        status: 'Cleared',
      }
    }).then(function (result) {
      return result.docs;
    }).catch(function (err) {
      console.log(err);
    });
  }

  clearTransaction(id) {
    return this.getTransaction(id).then(
      doc => {
        doc.status = "Cleared"
        return this._db.put(doc)
          .then(result => { console.log(result) })
          .catch(err => { console.log(err) })
      })
  }

  updateTransaction(transaction) {
    let updatedTransaction = {
      name: null,
      status: null,
      date: null,
      amount: null,
      direction: null,
      visible: null,
      sourceCatId: null,
      sourceAcctId: null,
      destCatId: null,
      destAcctId: null,
    }
    Object.assign(updatedTransaction, transaction);
    updatedTransaction.amount = 100 * Number(updatedTransaction.amount);
    return this._db.put(updatedTransaction)
      .then(result => { console.log(result) })
      .catch(err => { console.log(err) })
  }

  deleteTransaction(id) {
    return this._db.get(id).then(
      doc => {
        return this._db.remove(doc)
          .then(result => { console.log(result) })
          .catch(err => { console.log(err) })
      })
  }

  getTransaction(id) {
    return this._db.get(id);
  }

  getPendingTransactions() {
    return this._db.find({
      selector: { item: 'transaction', status: 'Pending', visible: true }
    }).then(function (result) {
      return result.docs;
    }).catch(function (err) {
      console.log(err);
    });
  }

  getClearedTransactions() {
    return this._db.find({
      selector: { item: 'transaction', status: 'Cleared', visible: true }
    }).then(function (result) {
      return result.docs;
    }).catch(function (err) {
      console.log(err);
    });
  }

  getTotalSpentThisMonthForCategory(categoryId) {
    let date = new Date();
    //format: 2011-10-05T14:48:00.000Z
    let month: any = date.getMonth() + 1;

    if (month < 10) month = "0" + month;

    let dateCompareString = date.getFullYear() + "-" + month + "-00T00:00:00.000Z";

    return this._db.find({
      selector:
        {
          item: 'transaction',
          visible: true,
          date: { $gte: dateCompareString },
          sourceCatId: categoryId,
        }
    }).then(function (result) {
      let totalSpent = 0;
      for (let i = 0; i < result.docs.length; i++) {
        totalSpent += result.docs[i].amount;
      }
      return totalSpent;
    }).catch(function (err) {
      console.log(err);
    });
  }

  // ACCOUNTS #######################################
  addAccount(account) {
    return this._db.post({
      item: 'account',
      name: account.name,
      amount: 100 * Number(account.amount),
      type: account.type,
    }).then(function (response) {
      return response;
    }).catch(function (err) {
      console.log(err);
    });
  }

  getAccounts() {
    return this._db.find({
      selector: { item: 'account' }
    }).then(function (result) {
      return result.docs;
    }).catch(function (err) {
      console.log(err);
    });
  }

  getAccountById(id) {
    return this._db.find({
      selector: { _id: id }
    }).then(function (result) {
      return result.docs[0];
    }).catch(function (err) {
      console.log(err);
    });
  }

  getAllInflowsForAccount(id) {
    return this._db.find({
      selector: { item: 'transaction', destAcctId: id }
    }).then(function (result) {
      return result.docs;
    }).catch(function (err) {
      console.log(err);
    });
  }

  getAllOutflowsForAccount(id) {
    return this._db.find({
      selector: { item: 'transaction', sourceAcctId: id }
    }).then(function (result) {
      return result.docs;
    }).catch(function (err) {
      console.log(err);
    });
  }

  updateAccount(account) {
    return this._db.put(account)
      .then(result => { })
      .catch(err => { console.log(err) })
  }

  updateAccountAmount(id, amount) {
    return this.getAccountById(id).then(
      account => {
        account.amount = Number(amount);
        return this.updateAccount(account).then(function (response) {
        }).catch(function (err) {
          console.log(err);
        });
      }
    )
  }

  deleteAccount(id) {
    return this._db.get(id).then(
      doc => {
        return this._db.remove(doc)
          .then(result => { })
          .catch(err => { console.log(err) })
      })
  }


  // CATEGORIES #######################################

  addCategoryHeader(name: string) {
    return this._db.post({
      item: 'header',
      name: name
    }).then(function (response) {
      console.log(response);
    }).catch(function (err) {
      console.log(err);
    });
  }

  addCategory(name: string, amount: number, targetAmount: number, parent: string) {
    return this._db.post({
      item: 'category',
      name: name,
      amount: 100 * Number(amount),
      targetAmount: 100 * Number(targetAmount),
      parent: parent,
      userDefined: true,
    }).then(function (response) {
      console.log(response);
    }).catch(function (err) {
      console.log(err);
    });
  }

  getCategoryById(id) {
    return this._db.find({
      selector: { _id: id }
    }).then(function (result) {
      return result.docs[0];
    }).catch(function (err) {
      console.log(err);
    });
  }

  updateCategory(category) {
    return this._db.put(category)
      .then(result => { console.log(result) })
      .catch(err => { console.log(err) })
  }

  updateGroup(group) {
    return this._db.put(group)
      .then(result => { console.log(result) })
      .catch(err => { console.log(err) })
  }

  updateCategoryAmount(id, amount) {
    return this.getCategoryById(id).then(
      category => {
        console.log(category);
        category.amount = Number(amount);
        return this.updateCategory(category).then(function (response) {
          console.log(response);
        }).catch(function (err) {
          console.log(err);
        });
      }
    )
  }

  getCategoryHeaders() {
    return this._db.find({
      selector: { item: 'header' }
    }).then(function (result) {
      return result.docs;
    }).catch(function (err) {
      console.log(err);
    });
  }

  getAllCategories() {
    return this._db.find({
      selector: { item: 'category' }
    }).then(function (result) {
      return result.docs;
    }).catch(function (err) {
      console.log(err);
    });
  }

  getAllUserDefinedCategories() {
    return this._db.find({
      selector: { item: 'category', userDefined: true }
    }).then(function (result) {
      return result.docs;
    }).catch(function (err) {
      console.log(err);
    });
  }

  getChildCategoriesOfParent(id) {
    return this._db.find({
      selector: { item: 'category', parent: id }
    }).then(function (result) {
      return result.docs;
    }).catch(function (err) {
      console.log(err);
    });
  }

  deleteCategory(id) {
    return this._db.get(id).then(
      item => {
        return this._db.remove(item)
          .then(result => { })
          .catch(err => { console.log(err) })
      });
  }

  deleteGroup(id) {
    return this._db.get(id).then(
      header => {
        return this._db.remove(header)
          .then(result => { })
          .catch(err => { console.log(err) })
      });
  }
}
