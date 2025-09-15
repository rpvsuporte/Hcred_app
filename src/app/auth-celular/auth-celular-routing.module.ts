import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthCelularPage } from './auth-celular.page';

const routes: Routes = [
  {
    path: '',
    component: AuthCelularPage
  },  {
    path: 'verify-code',
    loadChildren: () => import('./verify-code/verify-code.module').then( m => m.VerifyCodePageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthCelularPageRoutingModule {}
