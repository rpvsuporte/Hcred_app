import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { NavigationService } from '../services/navigation.service';
import { ApiService } from "../services/api.service";
import { AUTH_HASH } from '../services/auth-config';
import { ToastService } from '../services/toast.service';

@Component({
    selector: 'app-index',
    templateUrl: './index.page.html',
    styleUrls: ['./index.page.scss'],
    standalone: false
})
export class IndexPage implements OnInit {

    // Variáveis Iniciais

    urlImage: string = '';
    isLoading: boolean = true; 

    constructor(
        private navigationService: NavigationService,
        public alertController: AlertController,
        public apiService: ApiService,
        public toastService: ToastService
    ) {
        if (localStorage.getItem("idLogado") === null) {
            this.navigation('home');
        }
    }

    ngOnInit() {
        const payload = {
            idMaster: localStorage.getItem('idMaster') || '',
            auth_hash: AUTH_HASH
        };

        this.apiService.getBanner(payload).subscribe({
            next: (res: any) => {
                if (res.url) {
                    this.urlImage = res.url;
                } else {
                    this.toastService.error('Nenhum banner encontrado');
                }
                this.isLoading = false; 
            },
            error: () => {
                this.toastService.error('Erro ao carregar banner');
                this.isLoading = false; 
            }
        });
    }

    navigation(page: string, estatus?: string) {
        this.navigationService.navigate(page, estatus || '');
    }
}

