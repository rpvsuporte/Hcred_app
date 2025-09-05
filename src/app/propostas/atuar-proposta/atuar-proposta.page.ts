import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingController, NavController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';
import { NavigationService } from '../../services/navigation.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AUTH_HASH } from 'src/app/services/auth-config';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-atuar-proposta',
    templateUrl: './atuar-proposta.page.html',
    styleUrls: ['./atuar-proposta.page.scss'],
    standalone: false
})
export class AtuarPropostaPage implements OnInit {
    prop: any = {};
    propsStatus: any[] = [];
    public mostrarAtuacao = false;
    public opcaoSelecionada = '';
    public arquivoSelecionado: File | null = null;
    public exibirModalQRCode = false;
    public urlQRCode = '';
    public linkQRCode = '';
    public statusAtuacao = '';
    public msgAtuacao: any = {};
    public nomeArquivoAnexado: string = '';
    mostrarModal = false;
    liberacaoContaTerceiros = false;
    public listaBanks: any = [];
    public bancosFiltrados: any[] = [];
    public termoBuscaBanco: string = '';
    public mostrarListaBancos: boolean = false;
    maxLength: number = 14;
    chavePixValida: boolean = true;

    tipoRecebimento: string = '';
    tipoTerceiro: 'pf' | 'pj' | null = null;

    cpfValidoTerceiro: boolean = true;
    cnpjValidoTerceiro: boolean = true;

    dadosPix = {
        tipoChave: 'cpf',
        chave: ''
    };

    dadosBanco = {
        banco: '',
        agencia: '',
        conta: '',
        digito: '',
        tipoConta: 'corrente'
    };

    terceiroPJ = {
        razaoSocial: '',
        cnpj: '',
        vinculo: ''
    };

    terceiroPF = {
        nome: '',
        cpf: '',
        parentesco: '',
        parentescoOutros: ''
    };

    tiposAnexo = [
        "Link enviado para o cliente.",
        "Alteração cadastral - Telefone.",
        "Análise de Risco.",
        "Captação Externa (Cliente Novo).",
        "CNH",
        "Comprovante de Conta Bancária.",
        "Comprovante de Estorno.",
        "Comprovante Máquina.",
        "Comprovante Parentesco (Conta Terceiro).",
        "Contato realizado com o Banco Emissor.",
        "Contrato assinado.",
        "CPF",
        "Dados de Pagamento Conferidos.",
        "Entrar em contato com o cliente novamente.",
        "Enviar Contrato Online.",
        "Espelho",
        "Extratos bancários 3 últimos meses.",
        "Foto cartão frente.",
        "Foto cartão verso.",
        "Função 15 realizada.",
        "Link Preenchido.",
        "Print App Cartão.",
        "RG",
        "Selfie segurando cartão.",
        "Solicito Cancelamento."
    ];

    readonly titles: { [key: string]: string } = {
        'nova': 'Novas',
        'em analise': 'Em Análise',
        'pendentes': 'Pendentes',
        'negociacoes': 'Negociações',
        'link enviado': 'Link Enviado',
        'assinatura': 'Assinatura',
        'aprovadas': 'Aprovadas',
        'pagamentos': 'Pagamentos',
        'devolvidas': 'Devolvidas',
        'pagas': 'Pagas',
        'finalizadas': 'Finalizadas',
        'reprovada': 'Reprovadas',
        'canceladas': 'Canceladas',
        'contestacao': 'Contestação',
    };

    constructor(
        private toastService: ToastService,
        private apiService: ApiService,
        private navigationService: NavigationService,
        private loadingController: LoadingController,
        private http: HttpClient
    ) { }

    ngOnInit() {
        this.selectBanks();
    }

    ionViewWillEnter() {
        this.consultarProps();
        this.verificaAtuacao();
    }

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

    filtrarBancos() {
        const termo = this.termoBuscaBanco.toLowerCase();
        this.bancosFiltrados = this.listaBanks.filter((banco: any) =>
            banco.Name.toLowerCase().includes(termo)
        );
    }

    selecionarBancoInput(banco: any) {
        this.termoBuscaBanco = banco.Name;
        this.mostrarListaBancos = false;
        this.dadosBanco.banco = banco.Name;
    }

    ocultarComDelay() {
        setTimeout(() => this.mostrarListaBancos = false, 200);
    }

    get status(): string {
        const status = this.prop.estatus || '';
        return status.toLowerCase().split(' ').map((palavra: string) => palavra.charAt(0).toUpperCase() + palavra.slice(1)).join(' ');
    }

    async abrirCameraOuGaleria() {
        if ((window as any).Capacitor?.isNativePlatform()) {
            try {
                const image = await Camera.getPhoto({
                    quality: 80,
                    allowEditing: false,
                    resultType: CameraResultType.DataUrl,
                    source: CameraSource.Prompt,
                });

                const arquivo = this.base64ToFile(image.dataUrl!, `anexo.jpg`);
                this.arquivoSelecionado = arquivo;
                this.nomeArquivoAnexado = arquivo.name;

            } catch (error) {
                console.warn('Captura cancelada ou erro:', error);
            }
        } else {
            try {
                const response = await fetch('https://picsum.photos/400');
                const blob = await response.blob();
                const arquivo = new File([blob], 'simulado.jpg', { type: blob.type });

                this.arquivoSelecionado = arquivo;
                this.nomeArquivoAnexado = arquivo.name;

            } catch (error) {
                this.toastService.error('Erro ao carregar imagem simulada.');
            }
        }
    }

    base64ToFile(dataUrl: string, filename: string): File {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], filename, { type: mime });
    }

    limparAnexo() {
        this.arquivoSelecionado = null;
        this.nomeArquivoAnexado = '';
    }

    formatarChavePix(event: any) {
        const tipo = this.dadosPix.tipoChave;
        let valor = event.target.value.replace(/\D/g, '');

        if (tipo === 'cpf') {
            valor = valor.substring(0, 11);
            this.maxLength = 14;
            this.dadosPix.chave = valor.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');

        } else if (tipo === 'cnpj') {
            valor = valor.substring(0, 14);
            this.maxLength = 18;
            this.dadosPix.chave = valor.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');

        } else if (tipo === 'telefone') {
            valor = valor.substring(0, 11);
            this.maxLength = 15;
            this.dadosPix.chave = valor.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');

        } else {
            this.maxLength = 200;
            this.dadosPix.chave = event.target.value;
        }

        this.chavePixValida = this.validarChavePix();
    }

    formatarCPF(event: any) {
        let valor = event.target.value.replace(/\D/g, '').substring(0, 11);
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        this.terceiroPF.cpf = valor;
        this.validarCPFInput();
    }

    formatarCNPJ(event: any) {
        let valor = event.target.value.replace(/\D/g, '').substring(0, 14);
        valor = valor.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
        this.terceiroPJ.cnpj = valor;
        this.validarCNPJInput();
    }

    validarCPFInput() {
        const cpf = this.terceiroPF.cpf.replace(/\D/g, '');
        this.cpfValidoTerceiro = this.validarCPF(cpf);
    }

    validarCNPJInput() {
        const cnpj = this.terceiroPJ.cnpj.replace(/\D/g, '');
        this.cnpjValidoTerceiro = this.validarCNPJ(cnpj);
    }

    validarChavePix(): boolean {
        const chave = this.dadosPix.chave.replace(/\D/g, '');
        const tipo = this.dadosPix.tipoChave;

        if (tipo === 'cpf') {
            return this.validarCPF(chave);
        } else if (tipo === 'cnpj') {
            return this.validarCNPJ(chave);
        } else if (tipo === 'telefone') {
            return /^\d{11}$/.test(chave);
        } else if (tipo === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(this.dadosPix.chave.trim());
        } else if (tipo === 'aleatoria') {
            return /^[0-9a-f-]{32,36}$/i.test(this.dadosPix.chave.replace(/\s/g, ''));
        }

        return false;
    }

    validarCPF(cpf: string): boolean {
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

        let soma = 0;
        for (let i = 0; i < 9; i++) soma += +cpf[i] * (10 - i);
        let resto = (soma * 10) % 11;
        if (resto === 10) resto = 0;
        if (resto !== +cpf[9]) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) soma += +cpf[i] * (11 - i);
        resto = (soma * 10) % 11;
        if (resto === 10) resto = 0;
        return resto === +cpf[10];
    }

    validarCNPJ(cnpj: string): boolean {
        if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

        const validarDigito = (cnpj: string, posicoes: number[]): boolean => {
            const soma = cnpj.slice(0, posicoes.length).split('').reduce((acc, num, idx) => acc + +num * posicoes[idx], 0);
            const resto = soma % 11;
            const digito = resto < 2 ? 0 : 11 - resto;
            return digito === +cnpj[posicoes.length];
        };

        const posicoesPrimeiro = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const posicoesSegundo = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        return validarDigito(cnpj, posicoesPrimeiro) && validarDigito(cnpj, posicoesSegundo);
    }

    limparPix() {
        this.dadosPix.chave = '';
    }

    async consultarProps() {
        const loading = await this.loadingController.create({
            message: 'Carregando informações...',
            spinner: 'crescent',
            backdropDismiss: false
        });

        await loading.present();

        const data = {
            auth_hash: AUTH_HASH,
            idProposta: localStorage.getItem('idProposta'),
            idUser: localStorage.getItem("idLogado")
        };

        this.apiService.buscaPropsStatus(data).subscribe({
            next: (response) => {
                loading.dismiss();

                if (response.estatus === 'erro') {
                    this.toastService.error(response.mensagem);
                } else {
                    this.prop = response.resultadoProp;
                    this.propsStatus = response.resultadoPropsStatus;
                }
            },
            error: () => {
                loading.dismiss();
                this.toastService.error('Erro na conexão.');
            }
        });
    }

    verificaAtuacao() {
        const data = {
            auth_hash: AUTH_HASH,
            idProposta: localStorage.getItem('idProposta'),
            idUser: localStorage.getItem('idLogado')
        };

        this.apiService.verificarPropsView(data).subscribe({
            next: (response) => {
                if (response.estatus === 'erro') {
                    this.toastService.error(response.mensagem);
                } else {
                    this.statusAtuacao = response.estatus;

                    if (this.statusAtuacao === 'sendo atuada por outro') {
                        this.msgAtuacao = response.result;
                    }

                    if (this.statusAtuacao === 'sendo atuada por você') {
                        this.mostrarAtuacao = true;
                    }
                }
            },
            error: () => {
                this.toastService.error('Erro na conexão.');
            }
        });
    }

    fecharProposta(action: string) {
        const data = {
            auth_hash: AUTH_HASH,
            idProposta: localStorage.getItem('idProposta')
        };

        this.apiService.deletePropsView(data).subscribe({
            next: (response) => {
                if (response.estatus === 'erro') {
                    this.toastService.error(response.mensagem);
                } else {
                    this.mostrarAtuacao = false;
                    action === 'back' ? this.navigation('propostas') : '';
                }
            },
            error: () => {
                this.toastService.error('Erro na conexão.');
            }
        });
    }

    atuar() {
        const data = {
            auth_hash: AUTH_HASH,
            idProposta: localStorage.getItem('idProposta'),
            idUser: localStorage.getItem("idLogado")
        };

        this.apiService.cadPropsView(data).subscribe({
            next: (response) => {
                if (response.estatus === 'erro') {
                    this.toastService.error(response.mensagem);
                } else {
                    this.mostrarAtuacao = true;
                }
            },
            error: () => {
                this.toastService.error('Erro na conexão.');
            }
        });
    }

    async salvarAnexo() {
        if (!this.arquivoSelecionado || !this.opcaoSelecionada) {
            this.toastService.warning('Preencha o anexo e o tipo antes de salvar.');
            return;
        }

        const loading = await this.loadingController.create({
            message: 'Salvando anexo...',
            spinner: 'dots',
        });

        await loading.present();

        const formData = new FormData();
        formData.append('arquivo', this.arquivoSelecionado);
        formData.append('tipoAnexo', this.opcaoSelecionada);
        formData.append('idProposta', localStorage.getItem('idProposta') || '');
        formData.append('idUser', localStorage.getItem('idLogado') || '');
        formData.append('nomeLogado', localStorage.getItem('nomeLogado') || '');
        formData.append('auth_hash', AUTH_HASH);

        try {
            await firstValueFrom(this.apiService.S3Upload(formData));
            await loading.dismiss();
            this.toastService.success('Anexo enviado com sucesso!');
            this.limparAnexo();
            this.fecharProposta('keep');
            this.consultarProps();
        } catch (error) {
            console.error(error);
            await loading.dismiss();
            this.toastService.error('Erro ao enviar o anexo.');
        }
    }

    onTipoRecebimentoChange() {
        this.dadosPix = { tipoChave: 'cpf', chave: '' };
        this.dadosBanco = { banco: '', agencia: '', conta: '', digito: '', tipoConta: 'corrente' };
    }

    abrirModal() {
        this.mostrarModal = true;
        document.body.classList.add('modal-open');
    }

    fecharModal() {
        this.mostrarModal = false;
        document.body.classList.remove('modal-open');
    }

    async salvarDados() {
        const loading = await this.loadingController.create({
            message: 'Alterando dados...',
            spinner: 'crescent',
            backdropDismiss: false
        });

        await loading.present();

        const payload: any = {
            tipoRecebimento: this.tipoRecebimento,
            idProposta: localStorage.getItem('idProposta'),
            idUser: localStorage.getItem('idLogado'),
            nomeUsuario: localStorage.getItem('nomeLogado'),
            dados: {}
        };

        if (this.tipoRecebimento === 'pix') {
            payload.dados['tipoChave'] = this.dadosPix.tipoChave;
            payload.dados['chavePix'] = this.dadosPix.chave;
        } else if (this.tipoRecebimento === 'banco') {
            payload.dados['banco'] = this.dadosBanco.banco;
            payload.dados['ContaAgencia'] = this.dadosBanco.agencia;
            payload.dados['ContaCorrente'] = this.dadosBanco.conta;
            payload.dados['ContaDigito'] = this.dadosBanco.digito;
            payload.dados['tipoConta'] = this.dadosBanco.tipoConta;
        }

        if (this.liberacaoContaTerceiros) {
            payload.dados['terceiroConta'] = 1;

            if (this.tipoTerceiro === 'pf') {
                payload.dados['nomeTerceiro'] = this.terceiroPF.nome;
                payload.dados['cpfTerceiro'] = this.terceiroPF.cpf;
                payload.dados['parentesco'] = this.terceiroPF.parentesco;

                if (this.terceiroPF.parentesco === 'outros') {
                    payload.dados['parentescoOutros'] = this.terceiroPF.parentescoOutros;
                }

            } else if (this.tipoTerceiro === 'pj') {
                payload.dados['nomeTerceiro'] = this.terceiroPJ.razaoSocial;
                payload.dados['cpfTerceiro'] = this.terceiroPJ.cnpj;
                payload.dados['parentesco'] = this.terceiroPJ.vinculo;
            }
        }

        this.apiService.enviarDadosAlteracao({
            auth_hash: AUTH_HASH,
            tipoRecebimento: payload.tipoRecebimento,
            idProposta: payload.idProposta,
            idUser: payload.idUser,
            nomeUsuario: payload.nomeUsuario,
            dados: payload.dados
        }).subscribe({
            next: async (res) => {
                await loading.dismiss();

                if (res.status !== 'erro') {
                    console.log(res);
                    this.mostrarModal = false;
                    this.fecharProposta('keep');
                    this.consultarProps();
                    this.toastService.success('Dados salvos com sucesso!');
                } else {
                    this.toastService.error('Erro ao salvar os dados.');
                }
            },
            error: async () => {
                await loading.dismiss();
                this.toastService.error('Erro ao enviar os dados.');
            }
        });
    }


    // Função de redirecionamento

    navigation(page: string) {
        this.navigationService.navigate(page);
    }

    formatarObservacoes(observacao: string): string {
        if (!observacao) return '';
        return observacao.replace(/ - /g, '<br>');
    }


    // Função para abrir o anexo

    abrirAnexo(anexoUrl: string) {
        window.open(anexoUrl, '_blank');
    }
}
