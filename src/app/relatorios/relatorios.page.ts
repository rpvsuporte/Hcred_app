import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { ApiService } from '../services/api.service';
import { NavigationService } from '../services/navigation.service';
import { AUTH_HASH } from '../services/auth-config';
import { LoadingController } from '@ionic/angular';



@Component({
    selector: 'app-relatorios',
    templateUrl: './relatorios.page.html',
    styleUrls: ['./relatorios.page.scss'],
    standalone: false
})
export class RelatoriosPage implements OnInit {
    // Variáveis Iniciais

    dataInicial: string = '';
    dataInicialExibicao: string = ''; 
    dataFinal: string = '';
    dataFinalExibicao: string = '';
    tipoOperacao: string = '';
    statusSelecionado: string = '';
    gerenteSelecionado: string = '';
    colabSelecionado: string = '';

    propostas:any[] = [];
    gerentes:any[] = [];
    colaboradores:any[] = [];
    tiposDisponiveis: any[] = [];

    tipoUser = localStorage.getItem('tipoLogado');

    readonly options = [
        { value: 'nova', title: 'Novas' },
        { value: 'em analise', title: 'Em Análise' },
        { value: 'pendente', title: 'Pendentes' },
        { value: 'negociacão', title: 'Negociações' },
        { value: 'link', title: 'Link Enviado' },
        { value: 'assinatura', title: 'Assinatura' },
        { value: 'aprovada', title: 'Aprovadas' },
        // { value: 'pagamentos', title: 'Pagamentos' },
        { value: 'devolvidas', title: 'Devolvidas' },
        { value: 'paga', title: 'Pagas' },
        { value: 'finalizadas', title: 'Finalizadas' },
        { value: 'reprovada', title: 'Reprovadas' },
        { value: 'cancelada', title: 'Canceladas' },
        { value: 'contestação', title: 'Contestação' },
    ];

    constructor(
        private navCtrl: NavController,
        private alertController: AlertController,
        private apiService: ApiService,
        private navigationService: NavigationService,
        private loadingController: LoadingController 
    ) { 
    }

    ngOnInit() {
        localStorage.getItem('tipoLogado') !== 'Gerente' ? this.consultarGerente() : '';
        this.consultarTipo();
    }

    async consultarTipo() {
        const data = {
            auth_hash: AUTH_HASH,
            idFranqueado: localStorage.getItem('idFranqueado'),
            idUser: localStorage.getItem("idLogado")
        };

        this.apiService.buscaTipo(data).subscribe({
            next: (response) => {
                if (response.estatus === 'erro') {
                    this.alert(response.mensagem);
                } else {
                    const listaTipo = response.resultado;

                    this.tiposDisponiveis = listaTipo;
                }
            },
            error: () => {
                this.alert('Erro na conexão.');
            }
        });
    }


    mascararData(event: any, campo: 'dataInicial' | 'dataFinal') {
        let valor = event.target.value;

        // Remove tudo que não é número
        valor = valor.replace(/\D/g, '');

        // Aplica máscara dd/mm/aaaa
        if (valor.length > 2) valor = valor.slice(0, 2) + '/' + valor.slice(2);
        if (valor.length > 5) valor = valor.slice(0, 5) + '/' + valor.slice(5, 9);
        if (valor.length > 10) valor = valor.slice(0, 10);

        // Atualiza o input com a máscara
        event.target.value = valor;

        if (campo === 'dataInicial') {
            this.dataInicialExibicao = valor;
            this.dataInicial = this.converterParaISO(valor) || '';
        } else if (campo === 'dataFinal') {
            this.dataFinalExibicao = valor;
            this.dataFinal = this.converterParaISO(valor) || '';
        }
    }

    // Converter dd/mm/aaaa para yyyy-mm-dd (ISO)

    converterParaISO(data: string): string | null {
        const partes = data.split('/');
        if (partes.length === 3) {
            const [dia, mes, ano] = partes;
            if (
                dia.length === 2 &&
                mes.length === 2 &&
                ano.length === 4 &&
                this.validaData(dia, mes, ano)
            ) {
                return `${ano}-${mes}-${dia}`;
            }
        }
        return null;
    }

    // Valida se a data é válida (ex: 31/02 não é válida)

    validaData(dia: string, mes: string, ano: string): boolean {
        const d = parseInt(dia, 10);
        const m = parseInt(mes, 10);
        const a = parseInt(ano, 10);

        if (a < 1900 || a > 2100) return false;
        if (m < 1 || m > 12) return false;
        if (d < 1 || d > 31) return false;

        // Verifica dias máximos do mês
        
        const maxDias = [31, (a % 4 === 0 ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (d > maxDias[m - 1]) return false;

        return true;
    }

    // Função para trazer o gerente e o colaborador

    async consultarGerente() {
        const data = {
            auth_hash: AUTH_HASH,
            idFranqueado: localStorage.getItem('idFranqueado')
        };

        this.apiService.buscaGerente(data).subscribe({
            next: (response) => {
                if (response.estatus === 'erro') {
                    alert(response.mensagem);
                } else {
                    this.gerentes = response.resultadoGerente;
                }
            },
            error: () => {
                alert('Erro na conexão.');
            }
        });
    }

    async consultarColab() {
        const data = {
            auth_hash: AUTH_HASH,
            idGerente: this.gerenteSelecionado,
            idFranqueado: localStorage.getItem("idFranqueado")
        };

        this.apiService.buscaColab(data).subscribe({
            next: (response) => {
                if (response.estatus === 'erro') {
                    alert(response.mensagem);
                } else {
                    this.colaboradores = response.resultadoColab;
                }
            },
            error: () => {
                alert('Erro na conexão.');
            }
        });
    }

    // Função para consultar as propostas

    async consultarProps() {
        if (!this.dataInicial || !this.dataFinal || !this.statusSelecionado || !this.tipoOperacao) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        const inicio = new Date(this.dataInicial);

        const fim = new Date(this.dataFinal);

        if (fim < inicio) {
            alert('A data final não pode ser anterior à data inicial.');
            return;
        }

        const diffEmDias = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);

        if (diffEmDias > 30) {
            alert('O intervalo entre as datas não pode ser superior a 30 dias.');
            return;
        }

        const loading = await this.loadingController.create({
            message: 'Carregando...',
            spinner: 'crescent'
        });

        await loading.present();

        const data = {
            auth_hash: AUTH_HASH,
            dataInicio: this.dataInicial,
            dataFinal: this.dataFinal,
            status:    this.statusSelecionado,
            idGerente: this.gerenteSelecionado,
            idColaborador: this.colabSelecionado,
            idFranqueado: localStorage.getItem('idFranqueado'),
            tipoOperacao: this.tipoOperacao
        };

        this.apiService.buscaPropsRelatorios(data).subscribe({
            next: async (response) => {
                await loading.dismiss();
                
                if (response.estatus === 'erro') {
                    alert(response.mensagem);
                } else {
                    this.propostas = response.resultadoProp;
                }
            },
            error: async () => {
                await loading.dismiss();
                alert('Erro na conexão.');
            }
        });
    }


    // Função para limpar os inputs

    clear() {
        this.dataInicialExibicao = '';
        this.dataInicial = '';
        this.dataFinalExibicao = '';
        this.dataFinal = '';
        this.tipoOperacao = '';
        this.statusSelecionado = '';
        this.gerenteSelecionado = '';
        this.colabSelecionado = '';
        this.propostas = [];
    }

    // Função de redirecionamento 

    navigation(page: string, estatus?: string, idProposta?:string) {
        this.navigationService.navigate(page, estatus || '', idProposta || '');
    }

    async alert(mensagem: string) {
        const alert = await this.alertController.create({
            header: 'AVISO',
            message: mensagem,
            buttons: ['OK']
        });

        await alert.present();
    }
}
