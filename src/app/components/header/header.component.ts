import { Component, HostListener, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service'; 
import { NavigationService } from 'src/app/services/navigation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PopoverController } from '@ionic/angular';
import { AUTH_HASH } from 'src/app/services/auth-config';
import { ToastService } from 'src/app/services/toast.service'; 

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: true,
    imports: [IonicModule, FormsModule, CommonModule] 
})
export class HeaderComponent implements OnInit {
    
    // Variáveis iniciais

    public keyNome: any;
    public saldoValue: any;
    statusSelecionado: string = '';
    tipoRelatorioSelecionado: string = '';
    buscaProposta: string = '';
    tipoLogado: string = localStorage.getItem('tipoLogado') || '';
    mostrarPopover = false;

    readonly optionsProps = [
        { titulo: 'Novas', tipo: 'nova' },
        { titulo: 'Em Análise', tipo: 'em analise' },
        { titulo: 'Pendentes', tipo: 'pendente' },
        { titulo: 'Negociações', tipo: 'negociacão' },
        { titulo: 'Link Enviado', tipo: 'link' },
        { titulo: 'Assinatura', tipo: 'assinatura' },
        { titulo: 'Aprovadas', tipo: 'aprovada' },
        { titulo: 'Pagamentos', tipo: 'pagamento' },
        { titulo: 'Devolvidas', tipo: 'devolvida' },
        { titulo: 'Pagas', tipo: 'paga' },
        { titulo: 'Finalizadas', tipo: 'finalizadas' },
        { titulo: 'Reprovadas', tipo: 'reprovada' },
        { titulo: 'Canceladas', tipo: 'cancelada' },
        { titulo: 'Contestação', tipo: 'contestação' },
    ];

    constructor(
        private apiService: ApiService,
        private navigationService: NavigationService,
        private popoverCtrl: PopoverController,
        private toastService: ToastService 
    ) {
        if (localStorage.getItem("idLogado") === null) {
            this.navigation('home');
        }
        this.keyNome = localStorage.getItem("nomeLogado");
        this.saldoValue = localStorage.getItem("saldoLoja");
    }

    ngOnInit() {}

    get name(): string {
        const nome = this.keyNome || '';
        return nome.length > 12 ? nome.slice(0, 12) + '...' : nome;
    }

    async dismissPopover() {
        await this.popoverCtrl.dismiss();
    }

    // Função de logout

    logout() {
        localStorage.clear();
        this.navigation('home');
    }

    // Função do olho

    olhoClic() {
        this.saldoValue = (this.saldoValue == "● ● ● ●") ? localStorage.getItem('saldoLoja') : "● ● ● ●";
    }

    // Função de buscar proposta

    buscarPropostas() {
        const data = {
            auth_hash: AUTH_HASH,
            query: this.buscaProposta,
            [`id${this.tipoLogado}`]: localStorage.getItem(`id${this.tipoLogado}`)
        };

        this.apiService.buscaPropsAll(data).subscribe({
            next: (response) => {
                if (response.estatus === 'erro') {
                    this.toastService.warning(response.mensagem); 
                } else {
                    localStorage.setItem('propsQuery', JSON.stringify(response.resultado));
                    this.navigation('propostas');
                }
            },
            error: () => {
                this.toastService.error('Erro na conexão.'); 
            }
        });
    }

    @HostListener('document:click', ['$event'])
    handleOutsideClick(event: MouseEvent) {
        const target = event.target as HTMLElement;

        const clickedInsidePopover = target.closest('.popover-container');
        const clickedOnMenuLabel = target.closest('.menu-label');
        const isIonicOverlay = target.closest('ion-alert, ion-action-sheet, ion-modal, ion-picker, ion-popover, .select-interface-option');

        if (isIonicOverlay) return;

        if (!clickedInsidePopover && !clickedOnMenuLabel) {
            this.mostrarPopover = false;
        }
    }

    // Função de toogle

    togglePopover(event: MouseEvent) {
        event.stopPropagation(); 
        this.mostrarPopover = !this.mostrarPopover;
    }

    // Função de selecionar

    selecionarProposta(estatus: string) {
        this.navigation('propostas', estatus);
    }

    // Função de navegação

    navigation(page: string, estatus?: string) {
        this.navigationService.navigate(page, estatus || '');
    }

    // Função de alert

    async alert(texto: string) {
        this.toastService.info(texto); 
    }
}
