import { Component, OnInit } from '@angular/core'; 
import { ApiService } from '../../services/api.service';
import { NavController } from '@ionic/angular';
import { NavigationService } from '../../services/navigation.service';
import { ToastService } from '../../services/toast.service';
import { AUTH_HASH } from 'src/app/services/auth-config';

@Component({
    selector: 'app-banco',
    templateUrl: './banco.page.html',
    styleUrls: ['./banco.page.scss'],
    standalone: false
})
export class BancoPage implements OnInit {

    // Variáveis Iniciais

    public tipoRecebimento: string = '';
    public listaBanks: any = [];
    public bancosFiltrados: any[] = [];
    public termoBuscaBanco: string = '';
    public mostrarListaBancos: boolean = false;
    public errosCampos: { [key: string]: boolean } = {};

    public dadosBanco = {
        banco: '',
        agencia: '',
        conta: '',
        digito: '',
        tipoConta: ''
    };

    public dadosPix = {
        tipoChave: '',
        chave: ''
    };

    public liberacaoContaTerceiros: boolean = false;
    public tipoPessoaTerceiro: string = 'pf'; 

    public dadosTerceiro: any = {
        nomeTerceiro: '',
        cpfTerceiro: '',
        parentescoTerceiro: '',
        razaoSocialTerceiro: '',
        cnpjTerceiro: '',
        vinculoTerceiro: '',
        outrosParentesco: ''
    };

    constructor(
        private apiService: ApiService,
        private navigationService: NavigationService,
        private toastService: ToastService
    ) { }

    ngOnInit() {
        this.selectBanks();
    }

    // Função para selecionar os bancos

    async selectBanks() {
        this.apiService.buscaBanks({ auth_hash: AUTH_HASH }).subscribe({
            next: (response) => {
                if (response.estatus === 'erro') {
                    this.toastService.error(response.mensagem);
                } else {
                    this.listaBanks = response.resultado;
                    this.filtrarBancos();
                }
            },
            error: () => {
                this.toastService.error('Erro na conexão.');
            }
        });
    }

    // Função para filtrar os bancos

    filtrarBancos() {
        const termo = this.termoBuscaBanco.toLowerCase();
        this.bancosFiltrados = this.listaBanks.filter((banco: any) =>
            banco.Name.toLowerCase().includes(termo)
        );
    }

    // Função de selecionar o banco

    selecionarBancoInput(banco: any) {
        this.termoBuscaBanco = banco.Name;
        this.mostrarListaBancos = false;
        this.dadosBanco.banco = banco.Name;
    }

    ocultarComDelay() {
        setTimeout(() => this.mostrarListaBancos = false, 200);
    }

    // Função de validar os campos

    validarCampos(): boolean {
        this.errosCampos = {};
        let valido = true;

        if (!this.tipoRecebimento) {
            this.errosCampos['tipoRecebimento'] = true;
            this.toastService.warning('Selecione o tipo de recebimento.');
            valido = false;
        }

        if (this.tipoRecebimento === 'banco') {
            const camposBanco = ['banco', 'agencia', 'conta', 'digito', 'tipoConta'];
            camposBanco.forEach(campo => {
                const valor = this.dadosBanco[campo as keyof typeof this.dadosBanco];
                if (!valor || valor.trim() === '') {
                    this.errosCampos[campo] = true;
                    this.toastService.warning(`Campo ${campo} é obrigatório.`);
                    valido = false;
                }
            });
        }

        if (this.tipoRecebimento === 'pix') {
            if (!this.dadosPix.tipoChave) {
                this.errosCampos['tipoChave'] = true;
                this.toastService.warning('Selecione o tipo da chave PIX.');
                return false;
            }

            if (!this.dadosPix.chave || this.dadosPix.chave.trim() === '') {
                this.errosCampos['chave'] = true;
                this.toastService.warning('Informe a chave PIX.');
                return false;
            } else {
                const chave = this.dadosPix.chave.trim();
                let validaPix = true;
                switch (this.dadosPix.tipoChave) {
                    case 'cpf':
                        validaPix = this.validarCPF(chave);
                        break;
                    case 'cnpj':
                        validaPix = this.validarCNPJ(chave);
                        break;
                    case 'email':
                        validaPix = this.validarEmail(chave);
                        break;
                    case 'telefone':
                        validaPix = this.validarTelefone(chave);
                        break;
                    case 'aleatoria':
                        validaPix = chave.length >= 20 && chave.length <= 100;
                        break;
                }
                if (!validaPix) {
                    this.errosCampos['chave'] = true;
                    this.toastService.warning('Chave PIX inválida.');
                    return false;
                }
            }
        }

        if (this.liberacaoContaTerceiros) {
            if (this.tipoPessoaTerceiro === 'pf') {
                if (!this.dadosTerceiro.nomeTerceiro.trim()) {
                    this.errosCampos['nome'] = true;
                    this.toastService.warning('Nome do terceiro é obrigatório.');
                    valido = false;
                }
                if (!this.dadosTerceiro.cpfTerceiro.trim() || !this.validarCPF(this.dadosTerceiro.cpfTerceiro)) {
                    this.errosCampos['cpf'] = true;
                    this.toastService.warning('CPF do terceiro inválido.');
                    valido = false;
                }
                if (!this.dadosTerceiro.parentescoTerceiro) {
                    this.errosCampos['parentesco'] = true;
                    this.toastService.warning('Informe o parentesco do terceiro.');
                    valido = false;
                }
            }

            if (this.tipoPessoaTerceiro === 'pj') {
                if (!this.dadosTerceiro.razaoSocialTerceiro.trim()) {
                    this.errosCampos['razaoSocial'] = true;
                    this.toastService.warning('Razão social do terceiro é obrigatória.');
                    valido = false;
                }
                if (!this.dadosTerceiro.cnpjTerceiro.trim() || !this.validarCNPJ(this.dadosTerceiro.cnpjTerceiro)) {
                    this.errosCampos['cnpj'] = true;
                    this.toastService.warning('CNPJ do terceiro inválido.');
                    valido = false;
                }
                if (!this.dadosTerceiro.vinculoTerceiro.trim()) {
                    this.errosCampos['vinculo'] = true;
                    this.toastService.warning('Informe o vínculo do terceiro.');
                    valido = false;
                }
            }
        }

        return valido;
    }

    salvarBancoNoLocalStorage() {
        try {
            const dadosAntigos = JSON.parse(localStorage.getItem('dados') || '{}');
            const dadosAtualizados = {
                ...dadosAntigos,
                tipoRecebimento: this.tipoRecebimento,
                ...(this.tipoRecebimento === 'banco' ? this.dadosBanco : {}),
                ...(this.tipoRecebimento === 'pix' ? this.dadosPix : {}),
                ...(this.liberacaoContaTerceiros
                    ? { terceiroConta: 1, tipoTerceiro: this.tipoPessoaTerceiro, ...this.dadosTerceiro }
                    : { terceiroConta: 0 })
            };
            localStorage.setItem('dados', JSON.stringify(dadosAtualizados));
        } catch (e) {
            this.toastService.error('Erro ao salvar dados bancários.');
        }
    }

    avancar() {
        if (this.validarCampos()) {
            this.salvarBancoNoLocalStorage();
            this.navigation('simulador/anexos');
        } 
    }

    onTipoChavePixChange() {
        this.dadosPix.chave = ''; 
        this.errosCampos['chave'] = false;  
    }

    onInputChavePix(event: any) {
        let valor = event.target.value;

        if (!this.dadosPix.tipoChave) return;

        switch (this.dadosPix.tipoChave) {
            case 'cpf':
                valor = this.formatarCPF(valor).substring(0, 14);
                break;
            case 'cnpj':
                valor = this.formatarCNPJ(valor).substring(0, 18);
                break;
            case 'telefone':
                valor = this.formatarTelefone(valor).substring(0, 15);
                break;
            case 'email':
                valor = valor.substring(0, 200);
                break;
            case 'aleatoria':
                valor = valor.substring(0, 100);
                break;
        }

        this.dadosPix.chave = valor;
        event.target.value = valor;
    }

    // Validações simples usando regex

    validarCPF(valor: string): boolean {
        const cpf = valor.replace(/\D/g, '');

        if (cpf.length !== 11) return false;

        if (/^(\d)\1{10}$/.test(cpf)) return false;

        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }

        let resto = soma % 11;
        let digito1 = resto < 2 ? 0 : 11 - resto;

        if (digito1 !== parseInt(cpf.charAt(9))) return false;

        soma = 0;

        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = soma % 11;
        let digito2 = resto < 2 ? 0 : 11 - resto;
        if (digito2 !== parseInt(cpf.charAt(10))) return false;

        return true; // CPF válido
    }

    validarCNPJ(valor: string): boolean {
        const cnpj = valor.replace(/\D/g, '');

        if (cnpj.length !== 14) return false;

        if (/^(\d)\1{13}$/.test(cnpj)) return false;

        const calcularDigito = (cnpjParcial: string, pesos: number[]) => {
            let soma = 0;
            for (let i = 0; i < pesos.length; i++) {
                soma += parseInt(cnpjParcial.charAt(i)) * pesos[i];
            }
            let resto = soma % 11;
            return resto < 2 ? 0 : 11 - resto;
        };

        const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        const digito1 = calcularDigito(cnpj.substring(0, 12), pesos1);
        if (digito1 !== parseInt(cnpj.charAt(12))) return false;

        const digito2 = calcularDigito(cnpj.substring(0, 13), pesos2);
        if (digito2 !== parseInt(cnpj.charAt(13))) return false;

        return true; 
    }

    validarEmail(valor: string): boolean {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(valor);
    }

    validarTelefone(valor: string): boolean {
        const tel = valor.replace(/\D/g, '');
        return tel.length >= 10 && tel.length <= 11;
    }

    // Máscara para CPF (###.###.###-##)

    formatarCPF(valor: string): string {
        valor = valor.replace(/\D/g, ''); 

        if (valor.length > 3) {
            valor = valor.replace(/^(\d{3})(\d)/, '$1.$2');
        }
        if (valor.length > 6) {
            valor = valor.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
        }
        if (valor.length > 9) {
            valor = valor.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
        }

        return valor;
    }

    // Máscara para CNPJ (##.###.###/####-##)

    formatarCNPJ(valor: string): string {
        valor = valor.replace(/\D/g, '');
        valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
        valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
        return valor;
    }

    // Máscara para telefone (formato brasileiro simples)

    formatarTelefone(valor: string): string {
        valor = valor.replace(/\D/g, '');
        if (valor.length > 10) { // com 9 dígitos
            valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else {
            valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        }
        return valor;
    }

    // Máscara para formatar o CPF

    formatarCPFInput(event: any) {
        let valor = event.target.value;
        valor = valor.replace(/\D/g, '');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        event.target.value = valor;
        this.dadosTerceiro.cpfTerceiro = valor;
    }

    // Máscara para formatar o CNPJ

    formatarCNPJInput(event: any) {
        let valor = event.target.value;
        valor = valor.replace(/\D/g, '');
        valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
        valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
        event.target.value = valor;
        this.dadosTerceiro.cnpjTerceiro = valor;
    }

    // Função de redirecionamento

    navigation(page: string) {
        this.navigationService.navigate(page);
    }
}
