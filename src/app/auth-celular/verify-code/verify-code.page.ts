import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ToastService } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
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
    telefone = localStorage.getItem('telefone') || '';

    constructor(private userService: UserService, private apiService: ApiService, private toastService: ToastService, private navigationService: NavigationService) { }

    ngOnInit() {}

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

    async verificarCodigo() {
        if (this.codigoDigitado.length !== 7) return;
        this.isLoading = true;

        const data = {
            auth_hash: AUTH_HASH,
            idUser: localStorage.getItem('idLogado'),
            type: 'telefone',
            codigo: this.codigoDigitado.toUpperCase()
        };

        this.apiService.verificarCodigo(data).subscribe({
            next: async (res: any) => {
                this.isLoading = false;

                if(localStorage.getItem('resetSenha') !== 'true'){
                    if (res.estatus === 'success') {
                        this.toastService.success('Código verificado com sucesso!');
    
                        const usuario = localStorage.getItem('usuarioParcial')!;
                        const senha = localStorage.getItem('senhaParcial')!;
    
                        const resLogin = await this.userService.login(usuario, senha);
    
                        if (resLogin.dados) {
                            Object.entries(resLogin.dados).forEach(([chave, valor]) => {
                                if (chave !== 'senhaAcesso') localStorage.setItem(chave, valor != null ? String(valor) : '');
                            });
                        }
    
                        await this.userService.buscarSaldo();
    
                        localStorage.removeItem('usuarioParcial');
                        localStorage.removeItem('senhaParcial');
                        localStorage.removeItem('telefone');
                        localStorage.removeItem('emailValidado');
    
                        this.navigation('index');
                    } else {
                        this.toastService.warning(res.mensagem || 'Código inválido');
                    }
                } else {
                    localStorage.removeItem('resetSenha');
                    this.navigation('atualizar-senha');
                }

            },
            error: () => {
                this.isLoading = false;
                this.toastService.error('Erro ao se comunicar com o servidor');
            }
        });
    }


    reenviarCodigo(event: Event) {
        event.preventDefault();
        this.isLoading = true;

        const data = {
            auth_hash: AUTH_HASH,
            telefone: this.telefone,
            type: 'telefone',
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

    mascararTelefone(telefone: string): string {
        if (!telefone) return '';

        const numeros = telefone.replace(/\D/g, '');

        if (numeros.length < 8) return telefone; 

        const ddd = numeros.slice(0, 2);
        const meio = numeros.slice(2, -4); 
        const fim = '0000';

        return `(${ddd}) ${meio}-${fim}`;
    }

    navigation(page: string) {
        this.navigationService.navigate(page);
    }

    voltar() {
        localStorage.getItem('resetSenha') === 'true' ? this.navigation('choose-verify') : this.navigation('auth-celular'); 
    }

}


