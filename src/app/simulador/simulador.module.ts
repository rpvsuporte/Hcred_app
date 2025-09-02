import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SimuladorPageRoutingModule } from './simulador-routing.module';

import { SimuladorPage } from './simulador.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SimuladorPageRoutingModule
    ],
    declarations: [SimuladorPage]
})
export class SimuladorPageModule {}
