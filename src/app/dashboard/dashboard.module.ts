import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';
import { HeaderComponent } from '../components/header/header.component';
import { DashboardPage } from './dashboard.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        DashboardPageRoutingModule,
        HeaderComponent
    ],
    declarations: [DashboardPage]
})
export class DashboardPageModule {}
