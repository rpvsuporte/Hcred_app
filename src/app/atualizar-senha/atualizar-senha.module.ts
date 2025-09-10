import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AtualizarSenhaPageRoutingModule } from './atualizar-senha-routing.module';

import { AtualizarSenhaPage } from './atualizar-senha.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AtualizarSenhaPageRoutingModule
  ],
  declarations: [AtualizarSenhaPage]
})
export class AtualizarSenhaPageModule {}
