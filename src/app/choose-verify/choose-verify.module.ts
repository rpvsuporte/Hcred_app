import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChooseVerifyPageRoutingModule } from './choose-verify-routing.module';

import { ChooseVerifyPage } from './choose-verify.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChooseVerifyPageRoutingModule
  ],
  declarations: [ChooseVerifyPage]
})
export class ChooseVerifyPageModule {}
