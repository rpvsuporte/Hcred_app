import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AtualizarSenhaPage } from './atualizar-senha.page';

const routes: Routes = [
  {
    path: '',
    component: AtualizarSenhaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AtualizarSenhaPageRoutingModule {}
