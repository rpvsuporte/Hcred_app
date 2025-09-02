import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PropostasPage } from './propostas.page';

const routes: Routes = [
    {
        path: '',
        component: PropostasPage
    },
    {
        path: 'contrato',
        loadChildren: () => import('./contrato/contrato.module').then( m => m.ContratoPageModule)
    },
    {
        path: 'atuar-proposta',
        loadChildren: () => import('./atuar-proposta/atuar-proposta.module').then(m => m.AtuarPropostaPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PropostasPageRoutingModule {}
