import { Component } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { ToastService } from '../services/toast.service';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    standalone: false
})
export class HomePage {
    login: any = {};
    isLoading = false;
    showPassword = false;

    constructor(
        private navCtrl: NavController,
        private toastService: ToastService,
        private userService: UserService
    ) {}

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

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
                    this.navCtrl.navigateForward('atualizar-senha');
                    break;

                case 'verificacao_incompleta':
                    localStorage.setItem('idLogado', resLogin.idUser);
                    localStorage.setItem('usuarioParcial', this.login.usuario);
                    localStorage.setItem('senhaParcial', this.login.senha);
                    this.navCtrl.navigateForward('auth-email');
                    break;

                default:
                    // login completo
                    Object.entries(resLogin.dados).forEach(([chave, valor]) => {
                        if (chave !== 'senhaAcesso') localStorage.setItem(chave, valor != null ? String(valor) : '');
                    });
                    await this.userService.buscarSaldo();
                    this.navCtrl.navigateForward('index');
            }

        } catch (err) {
            console.error(err);
        } finally {
            this.isLoading = false;
        }
    }

    forgetPass() {
        this.navCtrl.navigateForward('forget-password');
    }
}
