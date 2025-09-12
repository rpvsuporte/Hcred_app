import { Component, OnInit } from '@angular/core'; 
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service'; 
import { NavigationService } from '../services/navigation.service';
import { AUTH_HASH } from '../services/auth-config';
import { Clipboard } from '@capacitor/clipboard';

interface Boleto {
    valor: any;
    codigo: string;
    validado: boolean | null;
    loading: boolean;
    adicionarOutro?: string;
}

@Component({
    selector: 'app-simulador',
    templateUrl: './simulador.page.html',
    styleUrls: ['./simulador.page.scss'],
    standalone: false
})
export class SimuladorPage implements OnInit { 
    
    // Variáveis iniciais

    public simula: any = {
        tipo: '',
        tabela: '',
        tipoPixFacil: '',
        valor: ''
    };

    boletos: Boleto[] = [
        {
            codigo: '',
            validado: null,
            loading: false,
            valor: 0,
            adicionarOutro: ''
        }
    ];

    adicionouOutroBoleto = false;
    public buttAcessa = false;
    public loadingAcessa = false;
    public tabelasDisponiveis: string[] = [];
    public tiposDisponiveis: string[] = [];
    public tipoValorSelecionado: 'limite' | 'solicitado' = 'solicitado';
    public listaResultado: any[] = [];
    public listaTabelas: any[] = [];
    public erroValor = false;
    public erroTipo = false;
    public erroTabela = false;
    public formInvalido = true;
    public tipoLogado = localStorage.getItem('tipoLogado')?.toLowerCase();

    constructor(
        private apiService: ApiService,
        private navigationService: NavigationService,
        private toastService: ToastService 
    ) {}

    ngOnInit(){
        this.consultarTipo();
    }

    // Função para validar formulário

    validarFormulario() {
        this.erroValor = !this.simula.valor || this.simula.valor === 'R$ 0,00';
        this.erroTipo = !this.simula.tipo;
        this.erroTabela = !this.simula.tabela && this.simula.tipo !== 'D Zero';
        this.formInvalido = this.erroValor || this.erroTipo || this.erroTabela;
    }

    // Função para consultar as tabelas

    async consultarTipo() {
        const data = {
            auth_hash: AUTH_HASH,
            idFranqueado: localStorage.getItem('idFranqueado'),
            idUser: localStorage.getItem("idLogado")
        };

        this.apiService.buscaTipo(data).subscribe({
            next: (response) => {
                if (response.estatus === 'erro') {
                    this.toastService.error(response.mensagem);
                } else {
                    this.tiposDisponiveis = response.resultado;
                }
            },
            error: () => {
                this.toastService.error('Erro na conexão.');
            }
        });
    }

    // Função para atualizar as tabelas

    atualizaTabelas() {
        this.simula.tabela = '';

        const data = {
            auth_hash: AUTH_HASH,
            idFranqueado: localStorage.getItem('idFranqueado'),
            tipo: this.simula.tipo
        };

        this.apiService.buscaTabelas(data).subscribe({
            next: (response) => {
                if (response.estatus === 'erro') {
                    this.toastService.error(response.mensagem);
                } else {
                    this.tabelasDisponiveis = response.resultado;
                }
            },
            error: () => {
                this.toastService.error('Erro na conexão.');
            }
        });
    }

    // Função para trocar o tipo

    setTipoValor(tipo: 'limite' | 'solicitado') {
        this.tipoValorSelecionado = tipo;
    }

    // Função para pegar a taxa

    private getTaxa(item: any): number {
        const taxaStr = this.tipoValorSelecionado === 'limite' ? item.taxaValorLiquido : item.taxa;
        return parseFloat(taxaStr.replace(',', '.')) || 0;
    }

    // Função para converter para o JS reconhecer

    private getValorNumerico(valor: any): number {
        if (typeof valor === 'number') return valor;
        if (typeof valor === 'string') {
            return parseFloat(valor.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
        }
        return 0;
    }

    // Função para calcular a parcela

    calculaParcela(item: any): number {
        const valor = this.getValorNumerico(this.simula.valor);
        const taxa = this.getTaxa(item);

        if (this.tipoValorSelecionado === 'limite') {
            return +(valor / item.prazo).toFixed(2);
        } else {
            return +(valor * taxa).toFixed(2);
        }
    }

    // Função para calcular o valor total

    calculaValorTotal(item: any): number {
        const parcela = this.calculaParcela(item);

        if (item.limiteNecessario === 'sim' && this.tipoValorSelecionado === 'solicitado') {
            return +(parcela * item.prazo).toFixed(2); 
        }

        return +parcela.toFixed(2); 
    }

    // Função para copiar o link

    async linkCopiado(item: any) {
        const valorTotal = this.formatarValorReal(this.calculaValorTotal(item));
        const valorParcela = this.formatarValorReal(this.calculaParcela(item));

        const data = {
            auth_hash: AUTH_HASH,
            valorFinanciado: this.simula.valor,
            valorParcela: `${item.prazo}x de ${valorParcela}`,
            valorTotal: valorTotal,
            parcelas: item.prazo,
            tipo: this.simula.tipo,
            tabela: this.simula.tabela,
            idUser: localStorage.getItem('idLogado')
        }

        this.apiService.gerarLink(data).subscribe({
            next: async (response) => {
                if (response.estatus === 'erro') {
                    this.toastService.error(response.mensagem);
                } else {
                    const hash = response.dados.sessionId;
                    const link = `https://loja.hcred.com.br/proposta/nova/?session=${hash}`;
                    await Clipboard.write({ string: link });
                    this.toastService.success('Link copiado para a área de transferência!');
                }
            },
            error: () => {
                this.toastService.error('Erro na conexão.');
            }
        });
    }

    // Transforma o valor brasileiro em um para a linguagem entender

    formatarMoeda(event: any) {
        let valor = event.target.value.replace(/\D/g, '');
        const valorNumerico = (Number(valor) / 100).toFixed(2);
        this.simula.valor = Number(valorNumerico).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    // Transforma o valor em brasileiro

    formatarValorReal(valor: number | string): string {
        return Number(valor).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    // Função de simular

    async simular() {
        this.validarFormulario();
        if (this.formInvalido) return;

        this.buttAcessa = true;
        this.loadingAcessa = true;

        const data = {
            auth_hash: AUTH_HASH,
            tipo: (this.simula.tipo).includes('Cartão de Crédito') ? 'Cartão de Crédito' : this.simula.tipo,
            tabela: this.simula.tabela,
            valor: this.simula.valor,
            idUser: localStorage.getItem("idLogado")
        };

        if ((this.simula.tipo).includes('Cartão de Crédito')) {
            this.apiService.criaCards(data).subscribe({
                next: (response) => {
                    if (response.estatus === 'erro') {
                        this.toastService.error(response.mensagem);
                    } else {
                        this.listaResultado = response.resultado;
                        this.simula.boletos = this.boletos.filter(b => b.validado).map(b => b.codigo);
                        localStorage.setItem('dados', JSON.stringify(this.simula));
                    }
                    this.buttAcessa = false;
                    this.loadingAcessa = false;
                },
                error: () => {
                    this.toastService.error('Erro na conexão.');
                    this.buttAcessa = false;
                    this.loadingAcessa = false;
                }
            });
        } else {
            localStorage.setItem('dados', JSON.stringify(this.simula));
            this.buttAcessa = false;
            this.loadingAcessa = false;
            this.navigation('simulador/cadastro');
        }
    }

    // Funções para validar o boleto e máscara

    validarBoleto(index: number) {
        const boleto = this.boletos[index];
        const valor = boleto.codigo.replace(/\D/g, '');

        const duplicado = this.boletos.filter(b => b.codigo.replace(/\D/g, '') === valor).length > 1;

        if (!valor || duplicado) {
            boleto.validado = false;
            return;
        }

        boleto.loading = true;
        boleto.validado = null;

        const data = {
            auth_hash: AUTH_HASH,
            boleto: boleto.codigo,
            idUser: localStorage.getItem("idLogado")
        };

        this.apiService.validarBoleto(data).subscribe({
            next: (response) => {
                boleto.loading = false;
                if (response.estatus === 'erro') {
                    this.toastService.error(response.mensagem);
                } else {
                    boleto.validado = true;
                    boleto.valor = response.valor;

                    const total = this.boletos.filter(b => b.validado === true && b.valor)
                        .reduce((acc, b) => acc + this.getValorNumerico(b.valor), 0);

                    this.simula.valor = total.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });

                    this.validarFormulario();
                }
            },
            error: () => {
                this.toastService.error('Erro na conexão.');
                boleto.loading = false;
            }
        });
    }

    todosBoletosValidos(): boolean {
        if (this.simula.tipo === 'Cartão de Crédito - Boleto') {
            return this.boletos.every(b => b.validado === true);
        }
        return true;
    }

    handleEscolhaOutroBoleto(event: any, index: number) {
        const valor = event.detail.value;

        if (valor === true && this.boletos.length < 3) {
            this.boletos.push({
                codigo: '',
                validado: null,
                valor: 0,
                loading: false,
                adicionarOutro: ''
            });
        }

        this.adicionouOutroBoleto = false; 
    }

    mascaraBoleto(event: any, index: number) {
        let valor = event.detail.value || '';
        valor = valor.replace(/\D/g, '');

        if (valor.length > 5) valor = valor.replace(/^(\d{5})(\d)/, '$1.$2');
        if (valor.length > 10) valor = valor.replace(/^(\d{5})\.(\d{5})(\d)/, '$1.$2 $3');
        if (valor.length > 16) valor = valor.replace(/(\d{5}) (\d{5})(\d{6})(\d)/, '$1 $2.$3 $4');
        if (valor.length > 27) valor = valor.replace(/(\d{5}) (\d{5})\.(\d{6}) (\d{5})(\d)/, '$1 $2.$3 $4.$5');

        this.boletos[index].codigo = valor;
    }

    // Função de redirecionamento

    salvarEAvancar(item: any) {
        const valorTotal = this.calculaValorTotal(item);

        this.simula.valorTotal = valorTotal.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        this.simula.valorParcela = this.calculaParcela(item).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        this.simula.prazo = item.prazo;

        const dados = {
            ...this.simula,
            valor: this.simula.valor.replace(/[^\d.,]/g, '').trim(),
            boletos: this.boletos.filter(b => b.validado).map(b => b.codigo)
        };

        localStorage.setItem('dados', JSON.stringify(dados));
        this.navigation('simulador/cadastro');
    }

    // Função que navegação

    navigation(page: string) {
        this.navigationService.navigate(page);
    }
}
