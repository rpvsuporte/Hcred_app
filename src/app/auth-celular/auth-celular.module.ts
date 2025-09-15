import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AuthCelularPageRoutingModule } from './auth-celular-routing.module';

import { AuthCelularPage } from './auth-celular.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuthCelularPageRoutingModule
  ],
  declarations: [AuthCelularPage]
})
export class AuthCelularPageModule {}
