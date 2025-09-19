// cadastro.page.ts

import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service'; 
import { NavigationService } from '../../services/navigation.service';
import { AUTH_HASH } from 'src/app/services/auth-config';

@Component({
    selector: 'app-cadastro',
    templateUrl: './cadastro.page.html',
    styleUrls: ['./cadastro.page.scss'],
    standalone: false
})
export class CadastroPage implements OnInit {
    
    // Variáveis Iniciais

    public cadastro: any = {
        cpf: '', nomeCompleto: '', rg: '', dataNascimento: '', sexo: '', whatsapp: '', celular: '',
        email: '', nomePai: '', nomeMae: '', naturalidade: '', bandeiraCartao: '', digitosCartao: '', 
        atividade: '', profissao: '', empresa: '', cnpj: '', salario: '', tempoEmpresa: '', dataInicio: '', 
        telefoneEmpresa: '', numBeneficio: '', especieBeneficio: '', valorBeneficio: '', outrasAtividades: '', 
        prazo: '', operadora: '', tipoOperacao: ''
    };

    public operacao: any = {};
    public listaResultado: any[] = [];
    public listaOperadoras: any[] = [];
    public tipoOperacao: string = '';
    public camposVisiveis: Set<string> = new Set();
    public errosCampos: any = {};
    private tiposCampos: any = {
        'Cartão de Crédito': ['cpf', 'nomeCompleto', 'email', 'whatsapp', 'celular', 'dataNascimento', 'rg', 'bandeiraCartao', 'digitosCartao', 'operadora'],
        'Cartão de Crédito - Boleto': ['cpf', 'nomeCompleto', 'email', 'whatsapp', 'celular', 'dataNascimento', 'rg', 'bandeiraCartao', 'digitosCartao'],
        'Crédito Consignado': ['prazo', 'cpf', 'nomeCompleto', 'tipoOperacao', 'operadora'],
        'Crédito Pessoal': ['prazo', 'cpf', 'nomeCompleto', 'email', 'whatsapp', 'celular', 'dataNascimento', 'rg', 'nomePai', 'nomeMae', 'naturalidade', 'sexo', 'atividade'],
        'D Zero': ['tipoOperacao', 'cpf', 'nomeCompleto', 'valorTotal', 'prazo'],
        'Financiamentos': ['prazo', 'cpf', 'nomeCompleto', 'email', 'whatsapp', 'celular', 'dataNascimento']
    };

    constructor(
        private apiService: ApiService,
        private navigationService: NavigationService,
        private toastService: ToastService 
    ) {}

    ionViewWillEnter() {
        const dados = JSON.parse(localStorage.getItem('dados') || '{}');
        if (dados.tipo === 'Cartão de Crédito') {
            if(dados.tabela.toUpperCase().includes('MAQUINETA')){
                this.cadastro.tipoOperacao = 'Máquina';
                this.listarOperadora();
            } else if(dados.tabela.toUpperCase().includes('ONLINE')){
                this.cadastro.tipoOperacao = 'On-line';
                this.listarOperadora();
            }
        }

        if (dados.tabela?.toUpperCase().includes('TABELA') && dados.tipo && this.tiposCampos[dados.tipo]) {
            this.tiposCampos[dados.tipo].push('tipoOperacao');
        }

        this.loadCadastroData();
    }

    ngOnInit() {}

    // Validação de campos

    validarCampos() {
        this.errosCampos = {}; 

        this.camposVisiveis.forEach((campo) => {
            const valor = this.cadastro[campo];

            if (!valor || valor.toString().trim() === '') {
                this.errosCampos[campo] = true;
                return; 
            }

            switch (campo) {
                case 'cpf':
                    if (!this.validarCPF(valor)) this.errosCampos[campo] = true;
                    break;
                case 'email':
                    if (!this.validarEmail(valor)) this.errosCampos[campo] = true;
                    break;
                case 'whatsapp':
                case 'celular':
                case 'telefoneEmpresa':
                    if (!this.validarTelefone(valor)) this.errosCampos[campo] = true;
                    break;
                case 'dataNascimento':
                    if (!this.validarDataNascimento(valor)) this.errosCampos[campo] = true;
                    break;
            }
        });

        if (Object.keys(this.errosCampos).length > 0) {
            this.toastService.error('Preencha corretamente todos os campos obrigatórios.');
        }

        return Object.keys(this.errosCampos).length === 0;
    }

    // Validação e máscara para a data

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

    mascararData(event: any) {
        let valor = event.target.value.replace(/\D/g, '');
        if (valor.length > 2) valor = valor.slice(0, 2) + '/' + valor.slice(2);
        if (valor.length > 5) valor = valor.slice(0, 5) + '/' + valor.slice(5, 9);
        if (valor.length > 10) valor = valor.slice(0, 10);
        event.target.value = valor;
    }

    // Função para salvar no localStorage

    salvarCadastroNoLocalStorage() {
        try {
            const dadosAntigos = JSON.parse(localStorage.getItem('dados') || '{}');
            const dadosAtualizados = { ...dadosAntigos, ...this.cadastro };

            if(this.operacao.tabela == 'PIX FÁCIL'){
                const texto = dadosAtualizados.prazo;
                const regexPrazo = /^(\d+)x/; 
                const matchPrazo = texto.match(regexPrazo);
                const prazo = matchPrazo ? parseInt(matchPrazo[1], 10) : null;

                const regexValor = /R\$\s?(\d{1,3}(\.\d{3})*),(\d{2})/u;
                const matchValor = texto.match(regexValor);

                let valorNumerico = null;
                if (matchValor) {
                    let valorString = matchValor[0].replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
                    valorNumerico = parseFloat(valorString);
                }

                dadosAtualizados.prazo = prazo; 
                dadosAtualizados.valorParcela = this.formatarValorReal(valorNumerico ?? 0);   
                dadosAtualizados.valorTotal = this.formatarValorReal((valorNumerico ?? 0) * (prazo ?? 0));
            }

            localStorage.setItem('dados', JSON.stringify(dadosAtualizados));
        } catch (e) {
            this.toastService.error('Erro ao salvar cadastro.');
            console.error('Erro ao salvar no localStorage:', e);
        }
    }

    // Função para ir para a próxima page

    continuar() {
        if (this.validarCampos()) {
            this.salvarCadastroNoLocalStorage();
            const dados = JSON.parse(localStorage.getItem('dados') || '{}');
            dados.tipo === 'Crédito Consignado' ? this.navigation('simulador/anexos') : this.navigation('simulador/endereco');
        }
    }

    // Função para carregar os campos

    private loadCadastroData() {
        this.operacao = JSON.parse(localStorage.getItem('dados') || '{}');
        if (this.operacao) {
            try {
                const data = { auth_hash: AUTH_HASH, tipo: this.operacao.tipo, tabela: this.operacao.tabela };
                this.apiService.criaParcelas(data).subscribe({
                    next: (response) => {
                        if (response.estatus !== 'erro') {
                            this.listaResultado = response.resultado;
                            if (this.operacao.tabela === 'PIX FÁCIL' && this.operacao.parcelas) {
                                this.cadastro.prazo = String(this.operacao.parcelas);
                            } else if (this.operacao.prazo) {
                                this.cadastro.prazo = String(this.operacao.prazo);
                            }
                        }
                    },
                    error: () => this.toastService.error('Erro ao carregar parcelas.'),
                });
            } catch (e) {
                console.error(e);
                this.toastService.error('Erro ao carregar dados da operação.');
            }
        }
        this.exibirCampos(this.operacao.tipo || ''); 
    }

    exibirCampos(tipo: string) {
        this.camposVisiveis.clear();
        const baseCampos = this.tiposCampos[tipo] || [];
        baseCampos.forEach((campo: string) => this.camposVisiveis.add(campo));

        if (this.operacao.tabela === 'PIX FÁCIL') {
            this.camposVisiveis.delete('bandeiraCartao');
            this.camposVisiveis.delete('digitosCartao');
        }

        if (['Crédito Pessoal'].includes(tipo)) {
            if (this.operacao.tabela !== 'PIX FÁCIL' && this.cadastro.atividade) {
                ['nomeReferencia', 'afinidadeReferencia', 'telefoneReferencia', 'celularReferencia'].forEach(campo => this.camposVisiveis.add(campo));
            }

            if (this.cadastro.atividade === 'Aposentado/Pensionista') {
                ['numBeneficio', 'especieBeneficio', 'valorBeneficio'].forEach(campo => this.camposVisiveis.add(campo));
            } else if (this.cadastro.atividade === 'Outras Atividades') {
                this.camposVisiveis.add('outrasAtividades');
            } else if (this.cadastro.atividade) {
                ['profissao', 'empresa', 'salario', 'tempoEmpresa', 'dataInicio', 'telefoneEmpresa', 'cnpj'].forEach(campo => this.camposVisiveis.add(campo));
            }
        }
    }

    // Função de listar a operadora

    listarOperadora() {
        try {
            const data = { auth_hash: AUTH_HASH, idFranqueado: localStorage.getItem('idFranqueado'), tipoOperacao: this.cadastro.tipoOperacao };
            this.apiService.listarOperadoras(data).subscribe({
                next: (response) => {
                    if (response.estatus !== 'erro') this.listaOperadoras = response.tabelas;
                },
                error: () => this.toastService.error('Erro ao carregar operadoras.')
            });
        } catch (e) {
            console.error(e);
            this.toastService.error('Erro ao carregar dados da operação.');
        }
    }

    // Função de validar CPF

    validarCPF(cpf: string): boolean {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

        let soma = 0;
        for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
        let resto = 11 - (soma % 11);
        let digito1 = resto >= 10 ? 0 : resto;
        if (digito1 !== parseInt(cpf.charAt(9))) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
        resto = 11 - (soma % 11);
        let digito2 = resto >= 10 ? 0 : resto;

        return digito2 === parseInt(cpf.charAt(10));
    }

    // Função de validar email

    validarEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        return regex.test(email.trim());
    }

    // Função de validar telefone

    validarTelefone(telefone: string): boolean {
        const somenteNumeros = telefone.replace(/\D/g, '');
        return somenteNumeros.length >= 10 && somenteNumeros.length <= 11;
    }

    // Função de validar data de nascimento

    validarDataNascimento(data: string): boolean {
        if (!data) return false;
        const [dia, mes, ano] = data.split('/');
        const nascimento = new Date(`${ano}-${mes}-${dia}T00:00:00`);
        const hoje = new Date();
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const diffMes = hoje.getMonth() - nascimento.getMonth();
        if (diffMes < 0 || (diffMes === 0 && hoje.getDate() < nascimento.getDate())) idade--;
        return idade >= 18 && nascimento <= hoje;
    }

    // Função de formatar CPF

    formatarCPF(event: any) {
        let valor = event.target.value.replace(/\D/g, '');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        event.target.value = valor;
        this.cadastro.cpf = valor;
        if (valor.length === 14) this.consultarCPF(valor);
    }

    // Função de formatar telefone
    
    formatarTelefone(event: any) {
        let valor = event.target.value.replace(/\D/g, '');
        valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
        event.target.value = valor;
    }

    // Função de consultar CPF

    consultarCPF(cpf: string) {
        const data = { auth_hash: AUTH_HASH, cpf };
        this.apiService.consultaCPF(data).subscribe({
            next: (response: any) => {
                if (response && response.estatus !== 'erro') this.preencherCampos(response.dados);
                else this.toastService.error('CPF não encontrado ou inválido.');
            },
            error: (err) => {
                console.error(err);
                this.toastService.error('Erro ao consultar CPF. Tente novamente.');
            }
        });
    }

    // Função de preencher os campos

    preencherCampos(dados: any) {
        localStorage.setItem('dadosCliente', JSON.stringify(dados));
        if (dados.nome) this.cadastro.nomeCompleto = dados.nome;
        if (dados.dataNascimento) this.cadastro.dataNascimento = dados.dataNascimento;
        if (dados.email) this.cadastro.email = dados.email;
        if (dados.celular) this.cadastro.celular = dados.celular;
        if (dados.whatsapp) this.cadastro.whatsapp = dados.telefone;
        if (dados.rg) this.cadastro.rg = dados.rg;
    }

    // Função de pegar o valor da parcela

    getValorParcela(parcela: any): string {
        const valorOperacao = parseFloat(this.converterMoedaParaNumero(this.operacao.valor));
        const taxaLiquido = parseFloat(String(parcela.valorSolicitado).replace(/,/g, '.'));
        const prazo = parseFloat(parcela.prazo);
        if (isNaN(valorOperacao) || isNaN(taxaLiquido) || isNaN(prazo) || prazo === 0) return this.formatarValorReal(0);
        return this.formatarValorReal((valorOperacao * taxaLiquido));
    }

    // Função de formatar valor

    formatarValorReal(valor: number | string): string {
        const num = parseFloat(String(valor).replace(/,/g, '.'));
        return isNaN(num) ? 'R$ 0,00' : num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Função de converter para número

    converterMoedaParaNumero(valorMoeda: string): string {
        if (!valorMoeda) return '0.00';
        const valorLimpo = valorMoeda.replace(/[R$BRL\s.]/g, '').replace(/,/g, '.');
        const num = parseFloat(valorLimpo);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    }

    // Função de redirecionamento

    navigation(page: string) {
        this.navigationService.navigate(page);
    }
}
