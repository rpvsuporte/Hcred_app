import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

    const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
    },
    {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule)
    },
    {
        path: 'simulador',
        loadChildren: () => import('./simulador/simulador.module').then(m => m.SimuladorPageModule)
    },
    {
        path: 'propostas',
        loadChildren: () => import('./propostas/propostas.module').then(m => m.PropostasPageModule)
    },
    {
        path: 'conta', 
        loadChildren: () => import('./conta/conta.module').then(m => m.ContaPageModule)
    },
    {
        path: 'relatorios',
        loadChildren: () => import('./relatorios/relatorios.module').then( m => m.RelatoriosPageModule)
    },
    {
        path: 'index',
        loadChildren: () => import('./index/index.module').then( m => m.IndexPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
    exports: [RouterModule]
})
export class AppRoutingModule {}
