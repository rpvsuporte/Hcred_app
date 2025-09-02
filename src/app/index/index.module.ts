import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IndexPageRoutingModule } from './index-routing.module';

import { HeaderComponent } from '../components/header/header.component';
import { IndexPage } from './index.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        IndexPageRoutingModule,
        HeaderComponent
    ],
    declarations: [IndexPage]
})
export class IndexPageModule {}
