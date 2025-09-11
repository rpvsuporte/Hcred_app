import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { AUTH_HASH, VERSION_APP } from '../services/auth-config';

@Component({
    selector: 'app-atualizar-senha',
    templateUrl: './atualizar-senha.page.html',
    styleUrls: ['./atualizar-senha.page.scss'],
    standalone: false
})
export class AtualizarSenhaPage {
    
    novaSenha: string = '';
    confirmaSenha: string = '';
    isLoading = false;
    showNovaSenha = false;
    showConfirmaSenha = false;

    constructor(
        private apiService: ApiService,
        private toastService: ToastService,
        private navCtrl: NavController
    ) {}

    async atualizarSenha() {
        if (this.novaSenha !== this.confirmaSenha) {
            this.toastService.error('As senhas não conferem.');
            return;
        }

        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_.]).{6,}$/;

        if (!regex.test(this.novaSenha)) {
            this.toastService.error('Senha inválida! Mínimo 6 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 especial.');
            return;
        }

        this.isLoading = true;

        const data = {
            auth_hash: AUTH_HASH,
            version: VERSION_APP,
            idUser: localStorage.getItem('idLogado'),
            nova_senha: this.novaSenha
        };

        this.apiService.atualizarSenha(data).subscribe({
            next: (res: any) => {
                if (res.estatus === 'sucesso') {
                    this.toastService.success(res.mensagem);
                    localStorage.clear(); 
                    this.navCtrl.navigateRoot('home');
                } else {
                    this.toastService.error(res.mensagem);
                }
                this.isLoading = false;
            },
            error: () => {
                this.toastService.error('Erro ao atualizar a senha.');
                this.isLoading = false;
            }
        });
    }

    toggleNovaSenha() {
        this.showNovaSenha = !this.showNovaSenha;
    }

    toggleConfirmaSenha() {
        this.showConfirmaSenha = !this.showConfirmaSenha;
    }
}
