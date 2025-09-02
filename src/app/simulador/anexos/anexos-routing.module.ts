import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnexosPage } from './anexos.page';

const routes: Routes = [
    {
        path: '',
        component: AnexosPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AnexosPageRoutingModule {}
