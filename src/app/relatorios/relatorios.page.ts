import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { NavigationService } from '../services/navigation.service';
import { AUTH_HASH } from '../services/auth-config';
import { LoadingController } from '@ionic/angular';



@Component({
    selector: 'app-relatorios',
    templateUrl: './relatorios.page.html',
    styleUrls: ['./relatorios.page.scss'],
    standalone: false
})
export class RelatoriosPage implements OnInit {
    // Variáveis Iniciais

    periodo: string = '';

    tipoUser = localStorage.getItem('tipoLogado');


    constructor(
        private navCtrl: NavController,
        private alertController: AlertController,
        private apiService: ApiService,
        private navigationService: NavigationService,
        private loadingController: LoadingController 
    ) { 
    }

    ngOnInit() {
    }


    // Função de redirecionamento 

    navigation(page: string, estatus?: string, idProposta?:string) {
        this.navigationService.navigate(page, estatus || '', idProposta || '');
    }

    async alert(mensagem: string) {
        const alert = await this.alertController.create({
            header: 'AVISO',
            message: mensagem,
            buttons: ['OK']
        });

        await alert.present();
    }
}
