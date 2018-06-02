import { NgModule } from '@angular/core';
import { TransactionModalComponent } from './transaction-modal/transaction-modal';
import { MoveMoneyModalComponent } from './move-money-modal/move-money-modal';
import { AccountModalComponent } from './account-modal/account-modal';
import { CategoryConfigModalComponent } from './category-config-modal/category-config-modal';
@NgModule({
	declarations: [TransactionModalComponent,
    MoveMoneyModalComponent,
    AccountModalComponent,
    AccountModalComponent,
    CategoryConfigModalComponent],
	imports: [],
	exports: [TransactionModalComponent,
    MoveMoneyModalComponent,
    AccountModalComponent,
    AccountModalComponent,
    CategoryConfigModalComponent]
})
export class ComponentsModule {}
