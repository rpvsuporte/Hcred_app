import { Component, OnInit } from '@angular/core'; 
import { ApiService } from '../../services/api.service';
import { AlertController, NavController } from '@ionic/angular';
import { NavigationService } from '../../services/navigation.service';
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
    public listaBanks:any = [];
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

    // Controle do toggle

    public liberacaoContaTerceiros: boolean = false;

    // Tipo da pessoa: 'pf' ou 'pj'

    public tipoPessoaTerceiro: string = 'pf'; 

    // Dados do terceiro

    public dadosTerceiro: any = {
        nomeTerceiro: '',
        cpfTerceiro: '',
        parentescoTerceiro: '',
        razaoSocialTerceiro: '',
        cnpjTerceiro: '',
        vinculoTerceiro: '',
        outrosParentesco: ''
    };

    constructor(private navCtrl: NavController,
        private alertController: AlertController,
        private apiService: ApiService,
        private navigationService: NavigationService) { }

    ngOnInit() {
        this.selectBanks();
    }

    // Função para trazer os bancos da API

    async selectBanks() {
        this.apiService.buscaBanks({auth_hash: AUTH_HASH}).subscribe({
            next: (response) => {
                if (response.estatus === 'erro') {
                    console.log(response.mensagem);
                } else {
                    this.listaBanks = response.resultado;
                    this.filtrarBancos();
                }
            },
            error: () => {
                console.log('Erro na conexão.');
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

    // Função de aparecer o banco no input

    selecionarBancoInput(banco: any) {
        this.termoBuscaBanco = banco.Name;
        this.mostrarListaBancos = false;
        this.dadosBanco.banco = banco.Name; 
    }

    // Função de fechar o banco

    ocultarComDelay() {
        setTimeout(() => this.mostrarListaBancos = false, 200);
    }

    // Função de alert

    alert(mensagem: any) {
        throw new Error('Method not implemented.');
    }

    // Função de validar os campos

    validarCampos(): boolean {
        this.errosCampos = {};
        let valido = true;

        if (!this.tipoRecebimento) {
            this.errosCampos['tipoRecebimento'] = true;
            valido = false;
        }

        if (this.tipoRecebimento === 'banco') {
            const camposBanco = ['banco', 'agencia', 'conta', 'digito', 'tipoConta'];
            camposBanco.forEach(campo => {
                const valor = this.dadosBanco[campo as keyof typeof this.dadosBanco];
                if (!valor || valor.trim() === '') {
                this.errosCampos[campo] = true;
                valido = false;
                }
            });
        }

        if (this.tipoRecebimento === 'pix') {
            if (!this.dadosPix.tipoChave) {
                this.errosCampos['tipoChave'] = true;
                valido = false;
                return false;
            }

            if (!this.dadosPix.chave || this.dadosPix.chave.trim() === '') {
                this.errosCampos['chave'] = true;
                valido = false;
                return false;
            } else {
                const chave = this.dadosPix.chave.trim();
                switch (this.dadosPix.tipoChave) {
                case 'cpf':
                    if (!this.validarCPF(chave)) {
                    this.errosCampos['chave'] = true;
                    return false;
                    }
                    break;
                case 'cnpj':
                    if (!this.validarCNPJ(chave)) {
                    this.errosCampos['chave'] = true;
                    return false;
                    }
                    break;
                case 'email':
                    if (!this.validarEmail(chave)) {
                    this.errosCampos['chave'] = true;
                    return false;
                    }
                    break;
                case 'telefone':
                    if (!this.validarTelefone(chave)) {
                    this.errosCampos['chave'] = true;
                    return false;
                    }
                    break;
                case 'aleatoria':
                    if (chave.length < 20 || chave.length > 100) {
                    this.errosCampos['chave'] = true;
                    return false;
                    }
                    break;
                }
            }
        }

        // Validação dos campos do terceiro, se toggle ativado
    
        if (this.liberacaoContaTerceiros) {
            if (this.tipoPessoaTerceiro === 'pf') {
                if (!this.dadosTerceiro.nomeTerceiro.trim()) {
                    this.errosCampos['nome'] = true;
                    valido = false;
                }
                if (!this.dadosTerceiro.cpfTerceiro.trim()) {
                    this.errosCampos['cpf'] = true;
                    valido = false;
                } else if (!this.validarCPF(this.dadosTerceiro.cpfTerceiro)) {
                    this.errosCampos['cpf'] = true;
                    return false;
                }
                if (!this.dadosTerceiro.parentescoTerceiro) {
                    this.errosCampos['parentesco'] = true;
                    valido = false;
                }
            }

            if (this.tipoPessoaTerceiro === 'pj') {
                if (!this.dadosTerceiro.razaoSocialTerceiro.trim()) {
                    this.errosCampos['razaoSocial'] = true;
                    valido = false;
                }
                if (!this.dadosTerceiro.cnpjTerceiro.trim()) {
                    this.errosCampos['cnpj'] = true;
                    valido = false;
                } else if (!this.validarCNPJ(this.dadosTerceiro.cnpjTerceiro)) {
                    this.errosCampos['cnpj'] = true;
                    return false;
                }
                if (!this.dadosTerceiro.vinculoTerceiro.trim()) {
                    this.errosCampos['vinculo'] = true;
                    valido = false;
                }
            }
        }

        return valido;
    }

    // Função para salvar no localStorage

    salvarBancoNoLocalStorage() {
        try {
            const dadosAntigos = JSON.parse(localStorage.getItem('dados') || '{}');
            
            const dadosAtualizados = {
                ...dadosAntigos,
                tipoRecebimento: this.tipoRecebimento,
                ...(this.tipoRecebimento === 'banco' ? this.dadosBanco : {}),
                ...(this.tipoRecebimento === 'pix' ? this.dadosPix : {}),
                ...(this.liberacaoContaTerceiros ? { terceiroConta: 1, tipoTerceiro: this.tipoPessoaTerceiro, ...this.dadosTerceiro } : { terceiroConta: 0 })
        };

            localStorage.setItem('dados', JSON.stringify(dadosAtualizados));
        } catch (e) {
            console.error('Erro ao salvar dados bancários no localStorage:', e);
        }
    }

    avancar() {
        if (this.validarCampos()) {
            this.salvarBancoNoLocalStorage();
            this.navigation('simulador/anexos');
        } 
    }

    // Chama ao trocar o tipo de Chave PIX

    onTipoChavePixChange() {
        this.dadosPix.chave = ''; 
        this.errosCampos['chave'] = false;  
    }

    onInputChavePix(event: any) {
        let valor = event.target.value;

        if (!this.dadosPix.tipoChave) return;

        switch (this.dadosPix.tipoChave) {
            case 'cpf':
                valor = this.formatarCPF(valor);
                valor = valor.substring(0, 14); // CPF com máscara: 000.000.000-00
                break;
            case 'cnpj':
                valor = this.formatarCNPJ(valor);
                valor = valor.substring(0, 18); // CNPJ com máscara: 00.000.000/0000-00
                break;
            case 'telefone':
                valor = this.formatarTelefone(valor);
                valor = valor.substring(0, 15); // telefone formatado (xx) xxxxx-xxxx
                break;
            case 'email':
                valor = valor.substring(0, 200); // limite arbitrário para email 
                break;
            case 'aleatoria':
                valor = valor.substring(0, 100); // limite padrão para chave aleatória do PIX
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

    async exibirAlerta(mensagem: string) {
        const alert = await this.alertController.create({
            header: 'Atenção',
            message: mensagem,
            buttons: ['OK']
        });
        await alert.present();
    }

    // Função de redirecionamento

    navigation(page: string) {
        this.navigationService.navigate(page);
    }
}
