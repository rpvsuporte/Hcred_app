import { Component, ElementRef, ViewChild } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { AlertController } from '@ionic/angular';
import { NavigationService } from '../services/navigation.service';
import { LoadingController } from '@ionic/angular';
import { AUTH_HASH } from '../services/auth-config';

@Component({
    selector: 'app-conta',
    templateUrl: './conta.page.html',
    styleUrls: ['./conta.page.scss'],
    standalone: false
})
export class ContaPage {

    // Valores iniciais

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
        public alertController: AlertController,
        private apiService: ApiService,
        private loadingController: LoadingController
    ) { }

    // Exibir dos dados da conta ao iniciar a tela

    async ngOnInit() {
        this.consultarContasAll();
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

    // Função chamada quando o modal estiver aberto

    abrirModal() {
        this.modal.present().then(() => {
            setTimeout(() => {
                this.inputSaque?.nativeElement?.setFocus();
            }, 100);
        });
    }

    // Função para formatar o valor

    formatarMoeda(event: any) {
        // Pega o valor atual do input e remove tudo que não for dígito

        let digits = event.target.value.replace(/\D/g, '');

        // Se o campo estiver vazio, zera os valores

        if (digits === '') {
            this.valorNumerico = 0;
            this.valorExibicao = '';
            event.target.value = '';
            return;
        }
        
        // Converte a string de dígitos para um número e divide por 100

        const valorReal = Number(digits) / 100;
        
        // Atualiza a variável com o valor numérico puro

        this.valorNumerico = valorReal;

        // Formata o número para o padrão de moeda brasileiro

        this.valorExibicao = valorReal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        // Força a atualização do valor no input para a string formatada

        event.target.value = this.valorExibicao;
    }

    // Função para listar as contas

    consultarContas(){
        if (!this.dataInicial || !this.dataFinal) {
            this.alert('Preencha a data inicial e final.');
            return;
        }

        const inicio = new Date(this.dataInicial);
        const fim = new Date(this.dataFinal);

        const diferencaDias = (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);

        if (diferencaDias > 30) {
            this.alert('O intervalo entre as datas não pode ser maior que 30 dias.');
            return;
        }

        if (diferencaDias < 0) {
            this.alert('A data final não pode ser menor que a inicial.');
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
                    alert(response.mensagem);
                } else {
                    this.contas = response.resultado;
                }
            },
            error: () => {
                alert('Erro na conexão.');
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
                    alert(response.mensagem);
                } else {
                    this.contas = response.resultado;
                }
            },
            error: () => {
                this.loading = false; 
                alert('Erro na conexão.');
            }
        });
    }

    // Função para sacar

    sacar(){
        if(!this.valorNumerico){
            this.alert('Por favor, preencha os campos corretamente');
            return;
        }

        if (this.valorNumerico < 30) {
            this.alert('Por favor, insira um valor válido para o saque.');
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
                    this.alert('Saque realizado com sucesso!', () => {
                        this.consultarContasAll(); 
                    });
                    
                    localStorage.setItem('saldoLoja', response.saldoDisponivel);
                    localStorage.setItem('saldoBlockLoja', response.saldoBlock);
                        
                    this.saldoValue = response.saldoDisponivel;
                    this.bloqueioValue = response.saldoBlock;
                } else {
                    this.alert(response.message || 'Ocorreu um erro.');
                }
            },
            error: (err: any) => {
                this.alert(err.error?.message || 'Erro de conexão.');
            }
        });
    }

    // Função de redirecionamento

    navigation(page: string, estatus?: string) {
        this.navigationService.navigate(page, estatus || '');
    }

    // Função de alert

    async alert(texto: string, callback?: () => void) {
        const alert = await this.alertController.create({
            header: 'AVISO',
            message: texto,
            buttons: [
                {
                    text: 'OK',
                    handler: () => {
                        if (callback) callback(); // chama a função após clicar em OK
                    }
                }
            ]
        });
        await alert.present();
    }
}
