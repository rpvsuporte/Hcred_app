import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { NavigationService } from '../services/navigation.service';
import { AUTH_HASH } from '../services/auth-config';

@Component({
    selector: 'app-relatorios',
    templateUrl: './relatorios.page.html',
    styleUrls: ['./relatorios.page.scss'],
    standalone: false
})
export class RelatoriosPage {

    // Variáveis Iniciais

    periodo: number = 0;

    constructor(
        private apiService: ApiService,
        private toastService: ToastService,
        public navigationService: NavigationService,
    ) { }

  gerarRelatorio() {
    if (!this.periodo) {
        this.toastService.warning('Selecione um período');
        return;
    }

    const payload = {
        idUser: localStorage.getItem('id' + localStorage.getItem('tipoLogado')) || '',
        tipoUser: localStorage.getItem('tipoLogado') || '',
        periodo: this.periodo,
        auth_hash: AUTH_HASH
    };

    this.apiService.gerarRelatorio(payload).subscribe({
        next: (res: any) => {
            if (res.url) {
                // Baixa o arquivo diretamente
                
                const link = document.createElement('a');
                link.href = res.url;
                link.target = '_blank';
                link.download = `relatorio_${this.periodo}dias.xls`;
                link.click();

                this.toastService.success('Relatório gerado com sucesso!');
            } else {
                this.toastService.warning('Relatório não encontrado');
            }
        },
        error: () => {
            this.toastService.error('Erro ao gerar relatório');
        }
    });
  }

    navigation(page: string, estatus?: string, idProposta?:string) {
        this.navigationService.navigate(page, estatus || '', idProposta || '');
    }
}
