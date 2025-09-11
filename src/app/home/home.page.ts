import { Component } from '@angular/core';
import { NavController } from "@ionic/angular";
import { ApiService } from "../services/api.service";
import { AUTH_HASH, VERSION_APP } from '../services/auth-config'; 
import { ToastService } from '../services/toast.service'; 
import { Platform } from '@ionic/angular';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    standalone: false
})
export class HomePage {

    // Variáveis Iniciais

    public login: any = {};
    resultadoLogin: any = {};
    isLoading = false;
    showPassword = false;

    constructor(
        private navCtrl: NavController,
        private apiService: ApiService,
        private toastService: ToastService,
        private platform: Platform 
    ) {
        const idLogado = localStorage.getItem("idLogado");
        const senhaExpirada = localStorage.getItem("senhaExpirada");

        if (idLogado && senhaExpirada !== "true") {
            this.buscarSaldo({
                idUser: localStorage.getItem("idLogado") || '',
                tipo: localStorage.getItem("tipoLogado") || '',
                idKey: 'id' + (localStorage.getItem("tipoLogado") || '')
            });
        } else {
            localStorage.clear();
        }
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    async loginApp() {
        this.isLoading = true;

        const plataforma = this.platform.is('android') ? 'APP - Android' : 'APP - IOS';

        const data = {
            auth_hash: AUTH_HASH,
            version: VERSION_APP,
            versao_login: plataforma,
            user_access: this.login.usuario,
            password_access: this.login.senha
        };

        this.apiService.loginApp(data).subscribe({
            next: async (resLogin) => {
                this.resultadoLogin = resLogin;

                if (this.resultadoLogin.estatus === "erro") {
                    this.toastService.error(this.resultadoLogin.mensagem);
                    this.isLoading = false;
                    return;
                }

                if (this.resultadoLogin.estatus === "senha_expirada") {
                    this.toastService.warning(this.resultadoLogin.mensagem);
                    localStorage.setItem('idLogado', this.resultadoLogin.idUser);
                    localStorage.setItem('senhaExpirada', 'true');
                    this.navCtrl.navigateForward('atualizar-senha'); 
                    this.isLoading = false;
                    return;
                }

                const tipoLogado = this.resultadoLogin.dados.tipoLogado;
                const idKey = 'id' + tipoLogado.charAt(0).toUpperCase() + tipoLogado.slice(1);

                // Salva dados do usuário no localStorage
                Object.entries(this.resultadoLogin.dados).forEach(([chave, valor]) => {
                    if (chave !== 'senhaAcesso') {
                        localStorage.setItem(chave, valor != null ? String(valor) : '');
                    }
                });

                localStorage.setItem('senhaAcesso', await this.hashSenha(this.resultadoLogin.dados.senhaAcesso));

                // Busca saldo usando a mesma função
                this.buscarSaldo({
                    idUser: this.resultadoLogin.dados.idLogado,
                    tipo: tipoLogado,
                    idKey: idKey
                });
            },
            error: () => {
                this.toastService.error("Erro na conexão com o servidor.");
                this.isLoading = false;
            }
        });
    }

    private buscarSaldo(params: { idUser: any, tipo: string, idKey: string }) {
        this.apiService.listarSaldo({
            auth_hash: AUTH_HASH,
            idUser: params.idUser,
            tipo: params.tipo,
            [params.idKey]: localStorage.getItem(params.idKey) ?? params.idUser
        }).subscribe({
            next: (resConta) => {
                if (resConta.estatus === "erro") {
                    this.toastService.warning(resConta.mensagem);
                } else {
                    localStorage.setItem('saldoLoja', resConta.dados.saldoDisponivel == '0' ? '0,00' : resConta.dados.saldoDisponivel);
                    localStorage.setItem('saldoBlockLoja', resConta.dados.saldoBloqueado == '0' ? '0,00' : resConta.dados.saldoBloqueado);
                    this.navCtrl.navigateForward('index');
                }
                this.isLoading = false;
            },
            error: () => {
                this.toastService.error("Erro ao buscar dados da conta.");
                this.isLoading = false;
            }
        });
    }

    async hashSenha(senha: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(senha);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}
