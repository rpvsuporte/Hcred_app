import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RelatoriosPage } from './relatorios.page';

const routes: Routes = [
    {
        path: '',
        component: RelatoriosPage
    },
    {
        path: 'finalizadas',
        loadChildren: () => import('./finalizadas/finalizadas.module').then( m => m.FinalizadasPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class RelatoriosPageRoutingModule {}
