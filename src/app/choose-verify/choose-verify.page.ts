import { Component } from '@angular/core';
import { NavigationService } from '../services/navigation.service';
import { ApiService } from "../services/api.service";
import { AUTH_HASH } from '../services/auth-config'; 
import { ToastService } from '../services/toast.service'; 

@Component({
    selector: 'app-choose-verify',
    templateUrl: './choose-verify.page.html',
    styleUrls: ['./choose-verify.page.scss'],
    standalone: false
})
export class ChooseVerifyPage {

    // Variáveis Iniciais

    email: string = localStorage.getItem('email') || '';
    telefone: string = localStorage.getItem('telefone') || '';


    constructor(        
        private navigationService: NavigationService,
        private apiService: ApiService,
        private toastService: ToastService) { }

    ngOnInit() {
    }

    formatarTelefone(telefone: string): string {
        if (!telefone) return '';

        let numeros = telefone.replace(/\D/g, '');
        
        // Se for telefone com DDD
        if (numeros.length === 11) {
            const ddd = numeros.substring(0, 2);
            const parte1 = numeros.substring(2, 3);  // 9
            const parte2 = '****';                   // máscara
            const parte3 = numeros.substring(7);     // últimos 4 dígitos

            return `(${ddd}) ${parte1}${parte2}-${parte3}`;
        } else if (numeros.length === 10) {
            const ddd = numeros.substring(0, 2);
            const parte1 = numeros.substring(2, 6);
            const parte2 = numeros.substring(6);
            return `(${ddd}) ${parte1}-${parte2}`;
        }

        return telefone;
    }

    mascararEmail(email: string): string {
        if (!email) return '';

        const [usuario, dominio] = email.split('@');
        if (!usuario || !dominio) return email;

        // Mostrar só os 3 primeiros caracteres e mascarar o resto
        const visivel = usuario.substring(0, 3);
        const oculto = '*'.repeat(Math.max(usuario.length - 3, 2));

        return `${visivel}${oculto}@${dominio}`;
    }

    navigation(page: string) {
        this.navigationService.navigate(page);
    }

    voltar() {
        this.navigation('home'); 
        localStorage.clear();
    }
}
