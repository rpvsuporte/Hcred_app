import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
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
        private navigationService: NavigationService,
        private apiService: ApiService,
        private toastService: ToastService
    ) {}

    async confirmarNomeUser() {
        if (!this.nomeUser) {
            this.toastService.warning('Nome de usuário inválido ou vazio.');
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

                    this.navigation('choose-verify'); 
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

    navigation(page: string) {
        this.navigationService.navigate(page);
    }

    voltar() {
        localStorage.clear();
        this.navigation('home'); 
    }

}
