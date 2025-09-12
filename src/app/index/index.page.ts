import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { NavigationService } from '../services/navigation.service';
import { ApiService } from "../services/api.service";

@Component({
    selector: 'app-index',
    templateUrl: './index.page.html',
    styleUrls: ['./index.page.scss'],
    standalone: false
})
export class IndexPage implements OnInit {

    constructor(
        private navigationService: NavigationService,
        public alertController: AlertController
    ) {
        if (localStorage.getItem("idLogado") === null) {
            this.navigation('home');
        }
    }

    ngOnInit() {}

    // Função de redirecionamento

    navigation(page: string, estatus?: string) {
        this.navigationService.navigate(page, estatus || '');
    }

}
