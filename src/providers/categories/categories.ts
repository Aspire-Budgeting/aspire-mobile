import { Injectable } from '@angular/core';
import { DatabaseProvider } from '../../providers/database/database';
import { SorterProvider } from '../sorter/sorter';
import { MoneyProvider } from '../money/money';


@Injectable()
export class CategoriesProvider {

  constructor(public database: DatabaseProvider, public sorter: SorterProvider, public moneyProvider: MoneyProvider) { }

  getCategoriesContruct() {
    let categoriesPromise = this.database.getAllUserDefinedCategories();
    let headersPromise = this.database.getCategoryHeaders();

    return Promise.all([categoriesPromise, headersPromise]).then(
      result => {
        let container = [];
        let categories = result[0];
        let headers = result[1];

        if (headers) {
          headers.sort(this.sorter.sortByName);
          headers.forEach(header => {
            header['categories'] = [];
            categories.forEach(category => {
              if (header._id === category.parent) header['categories'].push(category);
            });
            header.categories.sort(this.sorter.sortByName);
            container.push(header);
          });
          return container;
        }
      }
    )
  }

  getAllCategories() {
    return this.database.getAllCategories();
  }

  getChildCategoriesOfParent(id) {
    return this.database.getChildCategoriesOfParent(id);
  }

  getAllUserDefinedCategories() {
    return this.database.getAllUserDefinedCategories();
  }

  getTotalSpentThisMonthForCategory(categoryId) {
    return this.database.getTotalSpentThisMonthForCategory(categoryId);
  }

  updateCategoryAmount(id, amount) {
    return this.database.updateCategoryAmount(id, amount);
  }

  addCategory(name, amount, targetAmount, parent) {
    return this.database.addCategory(name, amount, targetAmount, parent);
  }

  addGroup(name) {
    return this.database.addCategoryHeader(name);
  }

  updateCategory(category){
    return this.database.updateCategory(category);
  }

  updateGroup(group){
    return this.database.updateGroup(group);
  }

  deleteGroup(id) {
    return this.database.deleteGroup(id);
  }

  deleteCategory(id) {
    return this.database.deleteCategory(id);
  }

  refreshAllCategories() {
    return this.getAllCategories().then(
      categories => {
        let allPromises = [];
        categories.forEach(category => {
          allPromises.push(this.moneyProvider.getCategoryTotal(category._id).then(
            amount => {
              return this.updateCategoryAmount(category._id, amount);
            }));
        });
        let promise = Promise.all(allPromises);
        return promise;
      });
  }

}
