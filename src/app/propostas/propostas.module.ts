import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PropostasPageRoutingModule } from './propostas-routing.module';

import { PropostasPage } from './propostas.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PropostasPageRoutingModule
    ],
    declarations: [PropostasPage]
})
export class PropostasPageModule {}
