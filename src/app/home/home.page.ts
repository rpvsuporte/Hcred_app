// Import's

import { Component } from '@angular/core';
import { AlertController, NavController } from "@ionic/angular";
import { ApiService } from "../services/api.service";
import { AUTH_HASH, VERSION_APP } from '../services/auth-config'; 

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss'],
    standalone: false
})
export class HomePage {

    public login: any = {};
    resultadoLogin: any = {};
    isLoading = false;

    constructor(
        private navCtrl: NavController,
        public alertController: AlertController,
        private apiService: ApiService
    ) {
        if (localStorage.getItem("idLogado")) {
            this.buscarSaldo({
                idUser: localStorage.getItem("idLogado") || '',
                tipo: localStorage.getItem("tipoLogado") || '',
                idKey: 'id' + (localStorage.getItem("tipoLogado") || '')
            });
        } else {
            localStorage.clear();
        }
    }

    async loginApp() {
        this.isLoading = true;

        const data = {
            auth_hash: AUTH_HASH,
            version: VERSION_APP,
            user_access: this.login.usuario,
            password_access: this.login.senha
        };

        this.apiService.loginApp(data).subscribe({
            next: async (resLogin) => {
                this.resultadoLogin = resLogin;

                if (this.resultadoLogin.estatus === "erro") {
                    this.alert(this.resultadoLogin.mensagem);
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
                this.alert("Erro na conexão com o servidor.");
                this.isLoading = false;
            }
        });
    }

    // Função unificada para buscar saldo
    private buscarSaldo(params: { idUser: any, tipo: string, idKey: string }) {
        this.apiService.listarSaldo({
            auth_hash: AUTH_HASH,
            idUser: params.idUser,
            tipo: params.tipo,
            [params.idKey]: localStorage.getItem(params.idKey) ?? params.idUser
        }).subscribe({
            next: (resConta) => {
                if (resConta.estatus === "erro") {
                    this.alert(resConta.mensagem);
                } else {
                    localStorage.setItem('saldoLoja', resConta.dados.saldoDisponivel == '0' ? '0,00' : resConta.dados.saldoDisponivel);
                    localStorage.setItem('saldoBlockLoja', resConta.dados.saldoBloqueado == '0' ? '0,00' : resConta.dados.saldoBloqueado);
                    this.navCtrl.navigateForward('index');
                }
                this.isLoading = false;
            },
            error: () => {
                this.alert("Erro ao buscar dados da conta.");
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

    async alert(texto: string) {
        const alert = await this.alertController.create({
            header: 'AVISO',
            message: texto,
            buttons: ['OK']
        });
        await alert.present();
    }
}

