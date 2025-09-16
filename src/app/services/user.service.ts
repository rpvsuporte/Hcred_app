import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';
import { AUTH_HASH, VERSION_APP } from './auth-config';
import { Platform } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class UserService {

    constructor(
        private apiService: ApiService,
        private toastService: ToastService,
        private platform: Platform
    ) {}

    async login(usuario: string, senha: string): Promise<any> {
        const plataforma = this.platform.is('android') ? 'APP - Android' : 'APP - IOS';

        const data = {
            auth_hash: AUTH_HASH,
            version: VERSION_APP,
            versao_login: plataforma,
            user_access: usuario,
            password_access: senha
        };

        return new Promise((resolve, reject) => {
            this.apiService.loginApp(data).subscribe({
                next: (resLogin) => resolve(resLogin),
                error: () => {
                    this.toastService.error('Erro na conexão com o servidor.');
                    reject('Erro na conexão');
                }
            });
        });
    }

    async buscarSaldo(): Promise<void> {
        const idUser = localStorage.getItem('idLogado');
        const tipoLogado = localStorage.getItem('tipoLogado') || '';
        const idKey = 'id' + tipoLogado.charAt(0).toUpperCase() + tipoLogado.slice(1);

        return new Promise((resolve, reject) => {
            this.apiService.listarSaldo({
                auth_hash: AUTH_HASH,
                [idKey]: localStorage.getItem(idKey) || idUser,
                idUser: idUser,
                tipo: tipoLogado
            }).subscribe({
                next: (res) => {
                    if (res.estatus === 'erro') {
                        this.toastService.warning(res.mensagem);
                    } else {
                        localStorage.setItem('saldoLoja', res.dados.saldoDisponivel == '0' ? '0,00' : res.dados.saldoDisponivel);
                        localStorage.setItem('saldoBlockLoja', res.dados.saldoBloqueado == '0' ? '0,00' : res.dados.saldoBloqueado);
                    }
                    resolve();
                },
                error: () => {
                    this.toastService.error('Erro ao buscar dados da conta.');
                    reject();
                }
            });
        });
    }
}
