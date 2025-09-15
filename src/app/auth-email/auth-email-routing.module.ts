import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthEmailPage } from './auth-email.page';

const routes: Routes = [
  {
    path: '',
    component: AuthEmailPage
  },  {
    path: 'verify-code',
    loadChildren: () => import('./verify-code/verify-code.module').then( m => m.VerifyCodePageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthEmailPageRoutingModule {}
