import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AtuarPropostaPageRoutingModule } from './atuar-proposta-routing.module';

import { AtuarPropostaPage } from './atuar-proposta.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AtuarPropostaPageRoutingModule
    ],
    declarations: [AtuarPropostaPage]
})
export class AtuarPropostaPageModule {}
