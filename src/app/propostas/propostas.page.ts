import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { NavigationService } from '../services/navigation.service';
import { MenuController, LoadingController } from '@ionic/angular';
import { AUTH_HASH } from 'src/app/services/auth-config';
import { ToastService } from '../services/toast.service'; 

@Component({
  selector: 'app-propostas',
  templateUrl: './propostas.page.html',
  styleUrls: ['./propostas.page.scss'],
  standalone: false
})
export class PropostasPage  {

    // Variáveis Iniciais

    mostrarInputFiltro = false;
    public filtroSelecionado: string = '';
    public valorFiltro: string = '';
    public labelFiltro: string = '';
    public tipoInput: string = 'text';
    status: string = localStorage.getItem('estatus') || '';
    idQuery: string = !localStorage.getItem('pontoVenda') ? `id${localStorage.getItem('tipoLogado') || ''}` : 'idPonto';
    propostas: any[] = [];

    currentPage = 1;
    readonly itemsPerPage = 6;

    readonly optionsProps = [
        { img: 'star', titulo: 'Novas', tipo: 'nova' },
        { img: 'hourglass', titulo: 'Em Análise', tipo: 'em analise' },
        { img: 'warning', titulo: 'Pendentes', tipo: 'pendente' },
        { img: 'people', titulo: 'Negociações', tipo: 'negociação' },
        { img: 'link', titulo: 'Link Enviado', tipo: 'link' },
        { img: 'create', titulo: 'Assinatura', tipo: 'assinatura' },
        { img: 'thumbs-up', titulo: 'Aprovadas', tipo: 'aprovada' },
        { img: 'wallet', titulo: 'Pagamentos', tipo: 'pagamentos' },
        { img: 'repeat', titulo: 'Devolvidas', tipo: 'devolvidas' },
        { img: 'cash', titulo: 'Pagas', tipo: 'paga' },
        { img: 'checkmark-circle', titulo: 'Finalizadas', tipo: 'finalizadas' },
        { img: 'thumbs-down', titulo: 'Reprovadas', tipo: 'reprovada' },
        { img: 'close-circle', titulo: 'Canceladas', tipo: 'cancelada' },
        { img: 'alert', titulo: 'Contestação', tipo: 'contestação' },
    ];

    readonly titles: { [key: string]: string } = {
        'nova': 'Novas',
        'em analise': 'Em Análise',
        'pendente': 'Pendentes',
        'negociacão': 'Negociações',
        'link': 'Link Enviado',
        'assinatura': 'Assinatura',
        'aprovada': 'Aprovadas',
        'pagamentos': 'Pagamentos',
        'devolvidas': 'Devolvidas',
        'paga': 'Pagas',
        'finalizadas': 'Finalizadas',
        'reprovada': 'Reprovadas',
        'cancelada': 'Canceladas',
        'contestação': 'Contestação',
    };

    readonly cores: { [key: string]: string } = {
        "Novas": "#fffdea",
        "Em Análise": "#ffe3b6",
        "Negociação": "#cdc5ff",
        "Aprovadas": "#defed3",
        "Pagamentos": "#d2ff71",
        "Devolvidas": "#d2ff71",
        "Reprovadas": "#fddede",
        "Pendentes": "#def4fd",
        "Pagas": "#a0d38e",
        "Finalizadas": "#d0dccc",
        "Formalizadas": "#FFD700",
        "Canceladas": "#cbbbbb",
        "Assinatura": "#a7b7d3",
        "Contestação": "#9E0000",
    };


    constructor(
        private apiService: ApiService,
        private navigationService: NavigationService,
        private menu: MenuController,
        private loadingController: LoadingController,
        private toastService: ToastService 
    ) { }

    ionViewWillEnter() {
        this.status = localStorage.getItem('estatus') || '';
        const propsQuery = localStorage.getItem('propsQuery');

        if (propsQuery) {
            this.propostas = JSON.parse(propsQuery);
            localStorage.removeItem('propsQuery');
        } else {
            this.propostas = [];
        }
        this.propostas.length == 0 ? this.consultarProps() : '';
    }

    get title(): string{
        return this.titles[this.status] || '';
    }

    get cor(): string {
        return this.cores[this.title] || '#ffffff';
    }

    onFiltroSelecionado() {
        this.mostrarInputFiltro = true;
        switch (this.filtroSelecionado) {
            case 'cpf':
                this.labelFiltro = 'CPF';
                this.tipoInput = 'text';
                break;
            case 'idProposta':
                this.labelFiltro = 'ID da Proposta';
                this.tipoInput = 'number';
                break;
        }
        this.valorFiltro = '';
    }

    aplicarMascaraOuVerificacao(event: any) {
        let valor = event.target.value;
        if (this.filtroSelecionado === 'cpf') {
            valor = valor.replace(/\D/g, '');
            if (valor.length > 11) valor = valor.slice(0, 11);
            valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
            valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
            valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        }
        this.valorFiltro = valor;
    }

    cancelarFiltro() {
        this.filtroSelecionado = '';
        this.valorFiltro = '';
        this.labelFiltro = '';
        this.mostrarInputFiltro = false;
    }


    realizarBusca(){
        const valor = this.valorFiltro.trim();
        if (!valor) {
            this.toastService.warning('Preencha o campo corretamente.');
            return;
        }

        if (this.filtroSelecionado === 'cpf' && !this.validarCPF(valor)) {
            this.toastService.warning('CPF inválido.');
            return;
        }

        if (this.filtroSelecionado === 'id' && isNaN(Number(valor))) {
            this.toastService.warning('ID inválido.');
            return;
        }

        const data = {
            auth_hash: AUTH_HASH,
            estatus: this.status,
            filtro: this.filtroSelecionado,
            valor: this.valorFiltro,
            [this.idQuery]: localStorage.getItem(this.idQuery),
            idUser: localStorage.getItem("idLogado")
        };

        this.apiService.buscaPropsFilter(data).subscribe({
            next: (response) => {
                if (response.estatus === 'erro') {
                    this.toastService.warning(response.mensagem);
                } else {
                    this.propostas = response.resultado;
                }
            },
            error: () => {
                this.toastService.error('Erro na conexão.');
            }
        });
    }

    validarCPF(cpf: string): boolean {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
        let soma = 0;
        for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
        let resto = 11 - (soma % 11);
        if (resto >= 10) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;
        soma = 0;
        for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
        resto = 11 - (soma % 11);
        if (resto >= 10) resto = 0;
        return resto === parseInt(cpf.charAt(10));
    }

    async consultarProps() {
        const loading = await this.loadingController.create({
            message: 'Carregando propostas...',
            spinner: 'crescent',
            translucent: true,
            backdropDismiss: false
        });

        await loading.present();

        const data = {
            auth_hash: AUTH_HASH,
            estatus: this.status,
            [this.idQuery]: localStorage.getItem(this.idQuery)
        };

        this.apiService.buscaProps(data).subscribe({
            next: async (response) => {
                await loading.dismiss();
                if (response.estatus === 'erro') {
                    this.toastService.warning(response.mensagem);
                } else {
                    this.propostas = response.resultado;
                }
            },
            error: async () => {
                await loading.dismiss();
                this.toastService.error('Erro na conexão.');
            }
        });
    }

    get paginatedPropostas() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return this.propostas.slice(start, start + this.itemsPerPage);
    }

    totalPages() {
        return Math.ceil(this.propostas.length / this.itemsPerPage);
    }

    nextPage() {
        if (this.currentPage < this.totalPages()) this.currentPage++;
    }

    prevPage() {
        if (this.currentPage > 1) this.currentPage--;
    }

    navigation(page: string, estatus?: string, idProposta?:string) {
        this.navigationService.navigate(page, estatus || '', idProposta || '');
    }

    selecionarStatus(status: string) {
        this.status = status;
        localStorage.setItem('estatus', status);
        this.currentPage = 1;
        this.consultarProps();
        this.menu.close('statusMenu');
    }
}
