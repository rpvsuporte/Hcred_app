import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { AUTH_HASH, VERSION_APP } from '../services/auth-config';

@Component({
    selector: 'app-forget-password',
    templateUrl: './forget-password.page.html',
    styleUrls: ['./forget-password.page.scss'],
    standalone: false
})
export class ForgetPasswordPage  {

    // Variáveis Iniciais

    nomeUser: string = '';
    isLoading = false;

    constructor(
        private navCtrl: NavController,
        private apiService: ApiService,
        private toastService: ToastService
    ) {}

    async confirmarEmail() {
        if (!this.nomeUser) {
            this.toastService.warning('Dado inválido');
            return;
        }

        this.isLoading = true;

        const data = {
            auth_hash: AUTH_HASH,
            nomeUser: this.nomeUser.trim()
        };

        this.apiService.verificarUser(data).subscribe({
            next: (res: any) => {
                if (res.estatus === 'success') {
                    this.toastService.success(res.mensagem);
                    localStorage.setItem('email', res.email);
                    localStorage.setItem('telefone', res.telefone);
                    localStorage.setItem('idLogado', res.idUser);

                    localStorage.setItem('resetSenha', 'true');
                    this.navCtrl.navigateForward('auth-email'); 
                } else {
                    this.toastService.warning(res.mensagem || 'Erro ao gerar código');
                }
                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
            }
        });
    }


    voltar() {
        this.navCtrl.back(); 
    }

}
