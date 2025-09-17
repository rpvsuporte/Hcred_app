import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChooseVerifyPage } from './choose-verify.page';

const routes: Routes = [
  {
    path: '',
    component: ChooseVerifyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChooseVerifyPageRoutingModule {}
