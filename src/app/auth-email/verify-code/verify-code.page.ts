import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ToastService } from 'src/app/services/toast.service';
import { AUTH_HASH } from 'src/app/services/auth-config';
import { NavigationService } from 'src/app/services/navigation.service';


@Component({
    selector: 'app-verify-code',
    templateUrl: './verify-code.page.html',
    styleUrls: ['./verify-code.page.scss'],
    standalone: false
})
export class VerifyCodePage implements OnInit {

    // Variáveis Iniciais

    codigoDigitado: string = '';
    parte1: string = '';
    parte2: string = '';
    isLoading: boolean = false;
    erro: boolean = false;
    email = localStorage.getItem('email') || '';
    telefone = localStorage.getItem('telefone') || '';

    constructor(private apiService: ApiService, private toastService: ToastService, private navigationService: NavigationService) { }

    ngOnInit() {}

    // Função para padronizar o texto

    onPrimeiraParte() {
        if (this.parte1.length === 3) {
            const nextInput = document.querySelectorAll('ion-input-otp')[1] as any;
            nextInput.setFocus();
        }
        this.atualizaCodigoDigitado();
    }

    onSegundaParte() {
        this.atualizaCodigoDigitado();
    }

    atualizaCodigoDigitado() {
        this.codigoDigitado = `${this.parte1}${this.parte2 ? '-' + this.parte2 : ''}`;

        if (this.parte1.length === 3 && this.parte2.length === 3) {
            this.verificarCodigo();
        }
    }

    // Função de verificar o código

    verificarCodigo() {
        if (this.codigoDigitado.length !== 7) return;

        this.isLoading = true;

        const data = {
            auth_hash: AUTH_HASH,
            type: 'email',
            idUser: localStorage.getItem('idLogado'),
            codigo: this.codigoDigitado.toUpperCase()
        };

        this.apiService.verificarCodigo(data).subscribe({
            next: (res: any) => {
                this.isLoading = false;

                if(localStorage.getItem('resetSenha') !== 'true'){
                    if (res.estatus === 'success') {
                        this.erro = false;
                        this.toastService.success('Código verificado com sucesso!');
                        localStorage.removeItem('email');
                        localStorage.setItem('emailValidado', 'true');
                        this.navigation('auth-celular'); 
                    } else {
                        this.erro = true;
                        this.toastService.warning(res.mensagem || 'Código inválido');
                    }
                } else {
                    localStorage.removeItem('resetSenha');
                    this.navigation('atualizar-senha');
                }
            },
            error: () => {
                this.isLoading = false;
                this.erro = true;
                this.toastService.error('Erro ao se comunicar com o servidor');
            }
        });
    }

    // Função de máscara para o email

    mascararEmail(email: string): string {
        if (!email) return '';

        const [usuario, dominio] = email.split('@');

        if (!usuario || !dominio) return email;

        const inicio = usuario.slice(0, 2);
        const oculto = '*'.repeat(Math.max(usuario.length - 2, 3)); 

        return `${inicio}${oculto}@${dominio}`;
    }

    // Função de reenviar código

    reenviarCodigo(event: Event) {
        event.preventDefault();
        this.isLoading = true;

        const data = {
            auth_hash: AUTH_HASH,
            email: this.email,
            type: 'email',
            idUser: localStorage.getItem('idLogado')
        };

        this.apiService.gerarCode(data).subscribe({
            next: (res: any) => {
                if (res.estatus === 'success') {
                    this.toastService.success(res.mensagem);
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

    // Função de redirecionamento

    navigation(page: string) {
        this.navigationService.navigate(page);
    }

    voltar() {
        localStorage.getItem('resetSenha') === 'true' ? this.navigation('choose-verify') : this.navigation('auth-email'); 
    }

}


