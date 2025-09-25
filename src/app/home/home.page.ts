import { Component } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { NavigationService } from '../services/navigation.service';
import { ToastService } from '../services/toast.service';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    standalone: false
})
export class HomePage {

    // Variáveis Iniciais

    login: any = {};
    isLoading = false;
    showPassword = false;

    constructor(
        private toastService: ToastService,
        private userService: UserService,
        private navigationService: NavigationService
    ) {
        const idLogado = localStorage.getItem("idLogado"); 
        const usuarioLogado = localStorage.getItem("usuarioLogado"); 
        const senhaExpirada = localStorage.getItem("senhaExpirada"); 

        if (idLogado && usuarioLogado === 'true' && senhaExpirada !== "true") { 
            this.userService.buscarSaldo().then(() => {
                this.navigation('index');
            });
        } else { 
            localStorage.clear(); 
        }
    }

    // Função de mudar o tipo de input

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    // Função de logar

    async loginApp() {
        if (!this.login.usuario || !this.login.senha) {
            this.toastService.warning('Preencha usuário e senha');
            return;
        }

        this.isLoading = true;

        try {
            const resLogin = await this.userService.login(this.login.usuario, this.login.senha);

            switch(resLogin.estatus) {
                case 'erro':
                    this.toastService.error(resLogin.mensagem);
                    break;

                case 'senha_expirada':
                    localStorage.setItem('idLogado', resLogin.idUser);
                    this.navigation('atualizar-senha');
                    break;

                case 'verificacao_incompleta':
                    localStorage.setItem('idLogado', resLogin.idUser);
                    localStorage.setItem('usuarioParcial', this.login.usuario);
                    localStorage.setItem('senhaParcial', this.login.senha);
                    this.navigation('auth-email');
                    break;

                default:
                    Object.entries(resLogin.dados).forEach(([chave, valor]) => {
                        if (chave !== 'senhaAcesso') localStorage.setItem(chave, valor != null ? String(valor) : '');
                    });
                    await this.userService.buscarSaldo();
                    this.navigation('index');
            }

        } catch (err) {
            console.error(err);
        } finally {
            this.isLoading = false;
        }
    }

    // Função de redirecionamento

    navigation(page: string, estatus?: string) {
        this.navigationService.navigate(page, estatus || '');
    }

}
