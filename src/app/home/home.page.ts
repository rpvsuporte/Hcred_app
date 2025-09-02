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

    // Variáveis Iniciais

    public login: any = {};
    resultadoLogin: any = {};

    isLoading = false;

    constructor(
        private navCtrl: NavController,
        public alertController: AlertController,
        private apiService: ApiService
    ) {
        if (localStorage.getItem("idLogado")) {
            this.apiService.listarSaldo({
                auth_hash: AUTH_HASH,
                idUser: localStorage.getItem("idLogado"),
                idFranqueado: localStorage.getItem("idFranqueado")
            }).subscribe({
                next: (resConta) => {
                    if (resConta.estatus === "erro") {
                        this.alert(resConta.mensagem);
                    } else {
                        localStorage.setItem('saldoLoja', resConta.dados.saldoDisponivel);
                        localStorage.setItem('saldoBlockLoja', resConta.dados.saldoBloqueado);
                        this.navCtrl.navigateForward('index');
                    }
                    this.isLoading = false;
                },
                error: () => {
                    this.alert("Erro ao buscar dados da conta.");
                    this.isLoading = false;
                }
            });
        } else {
            localStorage.clear();
        }
    }

    // Função de login

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

                // Salva dados do usuário
                
                Object.entries(this.resultadoLogin.dados).forEach(([chave, valor]) => {
                    if (chave !== 'senhaAcesso') {
                        localStorage.setItem(chave, valor != null ? String(valor) : '');
                    }
                });

                localStorage.setItem('senhaAcesso', await this.hashSenha(this.resultadoLogin.dados.senhaAcesso));

                // Buscando o saldo da loja

                this.apiService.listarSaldo({
                    auth_hash: AUTH_HASH,
                    idUser: this.resultadoLogin.dados.idLogado,
                    idFranqueado: this.resultadoLogin.dados.idFranqueado
                }).subscribe({
                    next: (resConta) => {
                        if (resConta.estatus === "erro") {
                            this.alert(resConta.mensagem);
                        } else {
                            localStorage.setItem('saldoLoja', resConta.dados.saldoDisponivel);
                            localStorage.setItem('saldoBlockLoja', resConta.dados.saldoBloqueado);
                            this.navCtrl.navigateForward('index');
                        }
                        this.isLoading = false;
                    },
                    error: () => {
                        this.alert("Erro ao buscar dados da conta.");
                        this.isLoading = false;
                    }
                });
            },
            error: () => {
                this.alert("Erro na conexão com o servidor.");
                this.isLoading = false;
            }
        });
    }

    // Função para colocar hash na senha

    async hashSenha(senha: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(senha);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Função de alert

    async alert(texto: string) {
        const alert = await this.alertController.create({
            header: 'AVISO',
            message: texto,
            buttons: ['OK']
        });
        await alert.present();
    }
}
