import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { NavigationService } from '../services/navigation.service';
import { LoadingController } from '@ionic/angular';
import { AUTH_HASH } from '../services/auth-config';
import { ToastService } from '../services/toast.service'; 

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.page.html',
    styleUrls: ['./dashboard.page.scss'],
    standalone: false,
})
export class DashboardPage implements OnInit {

    // Variáveis Iniciais

    propostasList: any[] = [];
    resultadoBusca: any = {};
    idQuery: string = !localStorage.getItem('pontoVenda') ? `id${localStorage.getItem('tipoLogado') || ''}` : 'idPonto';

    constructor(
        private apiService: ApiService,
        private navigationService: NavigationService,
        private loadingController: LoadingController,
        private toastService: ToastService 
    ) {
        if (localStorage.getItem("idLogado") === null) {
            this.navigation('home');
        } else {
            this.buscarDados();
        }
    }

    ngOnInit() {}

    // Função de loading e para carregar os cards

    async buscarDados() {
        const loading = await this.loadingController.create({
            message: 'Carregando informações...',
            spinner: 'crescent'
        });
        await loading.present();

        const data = {
            auth_hash: AUTH_HASH,
            [this.idQuery]: localStorage.getItem(this.idQuery)
        };

        this.apiService.countProps(data).subscribe(
            async (response) => {
                this.resultadoBusca = response;
                if (this.resultadoBusca.estatus === "erro") {
                    this.toastService.warning(this.resultadoBusca.mensagem);
                } else {
                    this.atualizarPropostas();
                }
                loading.dismiss();
            },
            async () => {
                loading.dismiss();
                this.toastService.error('Erro ao buscar dados do servidor.');
            }
        );
    }

    // Função de atualizar propostas

    atualizarPropostas() {
        const resultado = this.resultadoBusca.resultado || [];

        this.propostasList = [
            { tipo: 'nova', titulo: 'Novas', img: 'star', valor: this.getTotal(resultado, 'nova') },
            { tipo: 'em analise', titulo: 'Em Análise', img: 'hourglass', valor: this.getTotal(resultado, 'Em Análise') },
            { tipo: 'pendente', titulo: 'Pendentes', img: 'warning', valor: this.getTotal(resultado, 'Pendente') },
            { tipo: 'negociacão', titulo: 'Negociações', img: 'people', valor: this.getTotal(resultado, 'Negociação') },
            { tipo: 'link', titulo: 'Link Enviado', img: 'link', valor: this.getTotal(resultado, 'Link') },
            { tipo: 'assinatura', titulo: 'Assinatura', img: 'create', valor: this.getTotal(resultado, 'Assinatura') },
            { tipo: 'aprovada', titulo: 'Aprovadas', img: 'thumbs-up', valor: this.getTotal(resultado, 'Aprovada') },
            { tipo: 'pagamentos', titulo: 'Pagamentos', img: 'wallet', valor: this.getTotal(resultado, 'Pagamentos') },
            { tipo: 'devolvida', titulo: 'Devolvidas', img: 'repeat', valor: this.getTotal(resultado, 'Devolvidas') },
            { tipo: 'paga', titulo: 'Pagas', img: 'cash', valor: this.getTotal(resultado, 'Paga') },
            { tipo: 'finalizadas', titulo: 'Finalizadas', img: 'checkmark-circle', valor: this.getTotal(resultado, 'Finalizadas') },
            { tipo: 'reprovada', titulo: 'Reprovadas', img: 'thumbs-down', valor: this.getTotal(resultado, 'Reprovada') },
            { tipo: 'cancelada', titulo: 'Canceladas', img: 'close-circle', valor: this.getTotal(resultado, 'Cancelada') },
            { tipo: 'contestação', titulo: 'Contestação', img: 'alert', valor: this.getTotal(resultado, 'Contestação') }
        ];
    }

    // Função para pegar o total

    getTotal(resultado: any[], estatus: string): number {
        const found = resultado.find(item => item.estatus.toLowerCase() === estatus.toLowerCase());
        return found ? found.total : 0;
    }

    // Função de logout

    logout() {
        localStorage.clear();
        this.navigation('home');
    }

    // Função de redirecionamento

    navigation(page: string, estatus?: string) {
        this.navigationService.navigate(page, estatus || '');
    }
}
