import { Component, ElementRef, ViewChild } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { NavigationService } from '../services/navigation.service';
import { LoadingController } from '@ionic/angular';
import { AUTH_HASH } from '../services/auth-config';
import { ToastService } from '../services/toast.service'; 

@Component({
    selector: 'app-conta',
    templateUrl: './conta.page.html',
    styleUrls: ['./conta.page.scss'],
    standalone: false
})
export class ContaPage {

    // Variáveis Iniciais

    presentingElement!: HTMLElement | null;
    public saldoValue: string = localStorage.getItem('saldoLoja') || '';
    public bloqueioValue: string = localStorage.getItem('saldoBlockLoja') || '';
    public carregando: boolean = true;
    tipoSaque: string = '';
    dataInicial: string = '';
    dataInicialExibicao: string = ''; 
    valorExibicao: string = '';
    valorNumerico: number = 0;
    dataFinal: string = '';
    dataFinalExibicao: string = '';
    idQuery: string = !localStorage.getItem('pontoVenda') ? `id${localStorage.getItem('tipoLogado') || ''}` : 'idPonto';
    loading: boolean = false;

    resultadoBusca: any = {};
    listaResultado: any = [];
    contas:any = [];

    @ViewChild('modal', { static: false }) modal!: any;
    @ViewChild('inputSaque', { static: false }) inputSaque!: ElementRef;

    constructor(
        private navigationService: NavigationService,
        private apiService: ApiService,
        private loadingController: LoadingController,
        private toastService: ToastService 
    ) { }

    async ngOnInit() {
        this.consultarContasAll();
    }

    mascararData(event: any, campo: 'dataInicial' | 'dataFinal') {
        let valor = event.target.value;
        valor = valor.replace(/\D/g, '');
        if (valor.length > 2) valor = valor.slice(0, 2) + '/' + valor.slice(2);
        if (valor.length > 5) valor = valor.slice(0, 5) + '/' + valor.slice(5, 9);
        if (valor.length > 10) valor = valor.slice(0, 10);

        event.target.value = valor;

        if (campo === 'dataInicial') {
            this.dataInicialExibicao = valor;
            this.dataInicial = this.converterParaISO(valor) || '';
        } else if (campo === 'dataFinal') {
            this.dataFinalExibicao = valor;
            this.dataFinal = this.converterParaISO(valor) || '';
        }
    }

    converterParaISO(data: string): string | null {
        const partes = data.split('/');
        if (partes.length === 3) {
            const [dia, mes, ano] = partes;
            if (dia.length === 2 && mes.length === 2 && ano.length === 4 && this.validaData(dia, mes, ano)) {
                return `${ano}-${mes}-${dia}`;
            }
        }
        return null;
    }

    validaData(dia: string, mes: string, ano: string): boolean {
        const d = parseInt(dia, 10);
        const m = parseInt(mes, 10);
        const a = parseInt(ano, 10);
        if (a < 1900 || a > 2100) return false;
        if (m < 1 || m > 12) return false;
        if (d < 1 || d > 31) return false;
        const maxDias = [31, (a % 4 === 0 ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (d > maxDias[m - 1]) return false;
        return true;
    }

    abrirModal() {
        this.modal.present().then(() => {
            setTimeout(() => {
                this.inputSaque?.nativeElement?.setFocus();
            }, 100);
        });
    }

    formatarMoeda(event: any) {
        let digits = event.target.value.replace(/\D/g, '');
        if (digits === '') {
            this.valorNumerico = 0;
            this.valorExibicao = '';
            event.target.value = '';
            return;
        }
        const valorReal = Number(digits) / 100;
        this.valorNumerico = valorReal;
        this.valorExibicao = valorReal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        event.target.value = this.valorExibicao;
    }

    consultarContas(){
        if (!this.dataInicial || !this.dataFinal) {
            this.toastService.warning('Preencha a data inicial e final.');
            return;
        }

        const inicio = new Date(this.dataInicial);
        const fim = new Date(this.dataFinal);
        const diferencaDias = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);

        if (diferencaDias > 30) {
            this.toastService.warning('O intervalo entre as datas não pode ser maior que 30 dias.');
            return;
        }

        if (diferencaDias < 0) {
            this.toastService.warning('A data final não pode ser menor que a inicial.');
            return;
        }

        const data = {
            auth_hash: AUTH_HASH,
            dataInicio: this.dataInicial,
            dataFinal: this.dataFinal,
            tipo: this.tipoSaque,
            [this.idQuery]: localStorage.getItem(this.idQuery)
        };

        this.apiService.buscaContas(data).subscribe({
            next: (response) => {
                if (response.estatus === 'erro') {
                    this.toastService.warning(response.mensagem);
                } else {
                    this.contas = response.resultado;
                }
            },
            error: () => {
                this.toastService.error('Erro na conexão.');
            }
        });
    }

    consultarContasAll() {
        this.loading = true; 
        const data = {
            auth_hash: AUTH_HASH,
            [this.idQuery]: localStorage.getItem(this.idQuery)
        };

        this.apiService.buscaContasAll(data).subscribe({
            next: (response) => {
                this.loading = false; 
                if (response.estatus === 'erro') {
                    this.toastService.warning(response.mensagem);
                } else {
                    this.contas = response.resultado;
                }
            },
            error: () => {
                this.loading = false; 
                this.toastService.error('Erro na conexão.');
            }
        });
    }

    sacar(){
        if(!this.valorNumerico){
            this.toastService.warning('Por favor, preencha os campos corretamente');
            return;
        }

        if (this.valorNumerico < 30) {
            this.toastService.warning('Por favor, insira um valor válido para o saque.');
            return;
        }

        const data = {
            auth_hash: AUTH_HASH,
            valor: this.valorNumerico,
            saldoDisponivel: this.saldoValue,
            saldoBloqueado: this.bloqueioValue,
            [this.idQuery]: localStorage.getItem(this.idQuery),
            idLogado: localStorage.getItem('idLogado'),
            nomeLogado: localStorage.getItem('nomeLogado')
        };

        this.apiService.sacar(data).subscribe({
            next: (response: any) => {
                if(response.success){
                    this.toastService.success('Saque realizado com sucesso!');
                    this.consultarContasAll(); 
                    localStorage.setItem('saldoLoja', response.saldoDisponivel);
                    localStorage.setItem('saldoBlockLoja', response.saldoBlock);
                    this.saldoValue = response.saldoDisponivel;
                    this.bloqueioValue = response.saldoBlock;
                } else {
                    this.toastService.warning(response.message || 'Ocorreu um erro.');
                }
            },
            error: (err: any) => {
                this.toastService.error(err.error?.message || 'Erro de conexão.');
            }
        });
    }

    navigation(page: string, estatus?: string) {
        this.navigationService.navigate(page, estatus || '');
    }
}
