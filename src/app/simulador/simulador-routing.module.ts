import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SimuladorPage } from './simulador.page';

const routes: Routes = [
    {
        path: '',
        component: SimuladorPage
    },
    {
        path: 'cadastro',
        loadChildren: () => import('./cadastro/cadastro.module').then( m => m.CadastroPageModule)
    },
    {
        path: 'endereco',
        loadChildren: () => import('./endereco/endereco.module').then( m => m.EnderecoPageModule)
    },
    {
        path: 'banco',
        loadChildren: () => import('./banco/banco.module').then( m => m.BancoPageModule)
    },
    {
        path: 'anexos',
        loadChildren: () => import('./anexos/anexos.module').then( m => m.AnexosPageModule)
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SimuladorPageRoutingModule {}
