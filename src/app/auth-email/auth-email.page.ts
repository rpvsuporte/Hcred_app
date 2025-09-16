import { Component } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { ApiService } from "../services/api.service";
import { AUTH_HASH } from '../services/auth-config'; 
import { ToastService } from '../services/toast.service'; 

@Component({
    selector: 'app-auth-email',
    templateUrl: './auth-email.page.html',
    styleUrls: ['./auth-email.page.scss'],
    standalone: false
})
export class AuthEmailPage {

    // Variáveis Iniciais
    
    email: string = '';
    isLoading = false;

    constructor(
        private navigationService: NavigationService,
        private apiService: ApiService,
        private toastService: ToastService
    ) {
        
    }

    ngOnInit(){
        if (localStorage.getItem('resetSenha') === 'true') {
            this.enviarCodigoAutomatico();
        }
    }

    enviarCodigoAutomatico() {
        this.isLoading = true;

        const data = {
            auth_hash: AUTH_HASH,
            email: localStorage.getItem('email'), 
            type: 'email',
            idUser: localStorage.getItem('idLogado')
        };

        this.apiService.gerarCode(data).subscribe({
            next: (res: any) => {
                this.isLoading = false;
                if (res.estatus === 'success') {
                    this.navigation('auth-email/verify-code');
                } else {
                    this.toastService.warning(res.mensagem || 'Erro ao gerar código');
                }
            },
            error: () => {
                this.isLoading = false;
                this.toastService.error('Erro na comunicação com o servidor.');
            }
        });
    }

    async confirmarEmail() {
        if (!this.validarEmail(this.email.trim())) {
            this.toastService.warning('E-mail inválido');
            return;
        }

        this.isLoading = true;

        const data = {
            auth_hash: AUTH_HASH,
            type: 'email',
            email: this.email.trim(),
            idUser: localStorage.getItem('idLogado')
        };

        this.apiService.gerarCode(data).subscribe({
            next: (res: any) => {
                if (res.estatus === 'success') {
                    this.toastService.success(res.mensagem);
                    localStorage.setItem('email', this.email);

                    this.navigation('auth-email/verify-code'); 
                } else {
                    this.toastService.warning(res.mensagem || 'Erro ao gerar código');
                }
                this.isLoading = false;
            },
            error: () => {
                this.toastService.error('Erro na comunicação com o servidor.');
                this.isLoading = false;
            }
        });
    }

    validarEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email.toLowerCase());
    }

    navigation(page: string) {
        this.navigationService.navigate(page);
    }

    voltar() {
        this.navigation('home'); 
        localStorage.clear();
    }
}
