import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { ApiService } from "../services/api.service";
import { AUTH_HASH } from '../services/auth-config'; 
import { ToastService } from '../services/toast.service'; 

@Component({
    selector: 'app-auth-celular',
    templateUrl: './auth-celular.page.html',
    styleUrls: ['./auth-celular.page.scss'],
    standalone: false
})
export class AuthCelularPage implements OnInit {

    // Variáveis Iniciais

    telefone: string = localStorage.getItem('telefone') || '';
    isLoading: boolean = false;

    constructor(        
        private navigationService: NavigationService,
        private apiService: ApiService,
        private toastService: ToastService
    ) { }

    ngOnInit() {
        if (localStorage.getItem('resetSenha') === 'true') {
            this.enviarCodigoAutomatico();
        }
    }

    enviarCodigoAutomatico() {
        this.isLoading = true;

        const data = {
            auth_hash: AUTH_HASH,
            email: localStorage.getItem('telefone'), 
            type: 'telefone',
            idUser: localStorage.getItem('idLogado')
        };

        this.apiService.gerarCode(data).subscribe({
            next: (res: any) => {
                this.isLoading = false;
                if (res.estatus === 'success') {
                    this.navigation('auth-celular/verify-code');
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

    confirmarTelefone(){
        if (!this.validarTelefone(this.telefone.trim())) {
            this.toastService.warning('Telefone inválido');
            return;
        }

        this.isLoading = true;

        const data = {
            auth_hash: AUTH_HASH,
            type: 'telefone',
            telefone: this.telefone.trim(),
            idUser: localStorage.getItem('idLogado')
        };

        this.apiService.gerarCode(data).subscribe({
            next: (res: any) => {
                if (res.estatus === 'success') {
                    this.toastService.success(res.mensagem);
                    localStorage.setItem('telefone', this.telefone);

                    this.navigation('auth-celular/verify-code'); 
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

    validarTelefone(telefone: string): boolean {

        const numeros = telefone.replace(/\D/g, '');

        if (numeros.length < 10 || numeros.length > 11) {
            return false;
        }

        return true;
    }

    aplicarMascaraTelefone(event: any) {
        let valor = event.target.value.replace(/\D/g, '');

        if (valor.length > 11) {
            valor = valor.substring(0, 11);
        }

        if (valor.length <= 10) {
            valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        } else {
            valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3');
        }

        event.target.value = valor;
        this.telefone = valor;
    }

    navigation(page: string) {
        this.navigationService.navigate(page);
    }

    voltar() {
        this.navigation('auth-email/verify-code'); 
    }
}


