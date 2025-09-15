import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuthEmailPageRoutingModule } from './auth-email-routing.module';

import { AuthEmailPage } from './auth-email.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuthEmailPageRoutingModule
  ],
  declarations: [AuthEmailPage]
})
export class AuthEmailPageModule {}
