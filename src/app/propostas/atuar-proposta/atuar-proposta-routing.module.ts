import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AtuarPropostaPage } from './atuar-proposta.page';

const routes: Routes = [
    {
        path: '',
        component: AtuarPropostaPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AtuarPropostaPageRoutingModule {}
