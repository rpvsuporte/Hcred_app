import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinalizadasPageRoutingModule } from './finalizadas-routing.module';

import { FinalizadasPage } from './finalizadas.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        FinalizadasPageRoutingModule
    ],
    declarations: [FinalizadasPage]
})
export class FinalizadasPageModule {}
