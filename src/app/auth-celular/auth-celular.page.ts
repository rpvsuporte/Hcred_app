import { Component, OnInit } from '@angular/core';
import { NavController } from "@ionic/angular";
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

    telefone: string = '';
    isLoading: boolean = false;

    constructor(        
        private navCtrl: NavController,
        private apiService: ApiService,
        private toastService: ToastService
    ) { }

    ngOnInit() {
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

                    this.navCtrl.navigateForward('auth-celular/verify-code'); 
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
        // Remove tudo que não é número
        const numeros = telefone.replace(/\D/g, '');

        // Verifica se tem 10 ou 11 dígitos (fixo ou celular)
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

        // Formata o telefone
        if (valor.length <= 10) {
            // Formato fixo: (99) 9999-9999
            valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        } else {
            // Formato celular: (99) 99999-9999
            valor = valor.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3');
        }

        event.target.value = valor;
        this.telefone = valor;
    }


    voltar() {
        this.navCtrl.back(); 
    }
}


