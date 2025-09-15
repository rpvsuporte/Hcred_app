import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ToastService } from 'src/app/services/toast.service';
import { AUTH_HASH } from 'src/app/services/auth-config';
import { NavController } from '@ionic/angular';

@Component({
    selector: 'app-verify-code',
    templateUrl: './verify-code.page.html',
    styleUrls: ['./verify-code.page.scss'],
    standalone: false
})
export class VerifyCodePage implements OnInit {

    codigoDigitado: string = '';
    parte1: string = '';
    parte2: string = '';
    isLoading: boolean = false;
    erro: boolean = false;
    email = localStorage.getItem('email') || '';

    constructor(private apiService: ApiService, private toastService: ToastService, private navCtrl: NavController,) { }

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
        console.log(this.codigoDigitado);

        if (this.parte1.length === 3 && this.parte2.length === 3) {
            this.verificarCodigo();
        }
    }

    verificarCodigo() {
        if (this.codigoDigitado.length !== 7) return;

        this.isLoading = true;

        const data = {
            auth_hash: AUTH_HASH,
            idUser: localStorage.getItem('idLogado'),
            codigo: this.codigoDigitado.toUpperCase()
        };

        this.apiService.verificarCodigo(data).subscribe({
            next: (res: any) => {
                this.isLoading = false;
                if (res.estatus === 'success') {
                    this.erro = false;
                    this.toastService.success('Código verificado com sucesso!');
                    localStorage.removeItem('email');
                    this.navCtrl.navigateForward('auth-celular'); 
                } else {
                    this.erro = true;
                    this.toastService.warning(res.mensagem || 'Código inválido');
                }
            },
            error: () => {
                this.isLoading = false;
                this.erro = true;
                this.toastService.error('Erro ao se comunicar com o servidor');
            }
        });
    }

    reenviarCodigo(event: Event) {
        event.preventDefault();
        this.isLoading = true;

        const data = {
            auth_hash: AUTH_HASH,
            email: this.email,
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

    voltar() {
        this.navCtrl.back(); 
    }

}


