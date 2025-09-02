import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AnexosPageRoutingModule } from './anexos-routing.module';
import { SuccessModalComponent } from 'src/app/components/success-modal/success-modal.component';

import { AnexosPage } from './anexos.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AnexosPageRoutingModule
    ],
    declarations: [AnexosPage, SuccessModalComponent]
})
export class AnexosPageModule {}
