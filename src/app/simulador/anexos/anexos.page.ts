import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AlertController, LoadingController, ModalController, NavController } from '@ionic/angular';
import { NavigationService } from '../../services/navigation.service';
import { SuccessModalComponent } from 'src/app/components/success-modal/success-modal.component';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AUTH_HASH } from 'src/app/services/auth-config';
import { firstValueFrom } from 'rxjs';


interface Anexo {
    arquivo: File | null;
    tipo: string;
    nomeArquivo?: string;
}

@Component({
    selector: 'app-anexos',
    templateUrl: './anexos.page.html',
    styleUrls: ['./anexos.page.scss'],
    standalone: false
})
export class AnexosPage implements OnInit {
    // Variáveis iniciais

    anexos: Anexo[] = [
        { arquivo: null, tipo: '' },
        { arquivo: null, tipo: '' },
        { arquivo: null, tipo: '' },
        { arquivo: null, tipo: '' }
    ];

    errosAnexos: { arquivo: boolean; tipo: boolean }[] = [
        { arquivo: false, tipo: false },
        { arquivo: false, tipo: false },
        { arquivo: false, tipo: false },
        { arquivo: false, tipo: false }
    ];

    contratoOnline: string = '';
    public erroContratoOnline = false;

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

    constructor(
        private navCtrl: NavController,
        private alertController: AlertController,
        private apiService: ApiService,
        private navigationService: NavigationService,
        private modalController: ModalController,
        private loadingController: LoadingController
    ) { }

    ngOnInit() {
    }

    loading: HTMLIonLoadingElement | null = null;

    // Função de validar anexos

    validarAnexos(): boolean {
        let tudoOk = true;

        this.errosAnexos = this.anexos.map(() => ({ arquivo: false, tipo: false }));

        for (let i = 0; i < this.anexos.length; i++) {
            const anexo = this.anexos[i];
            const arquivoPreenchido = !!anexo.arquivo;
            const tipoPreenchido = !!anexo.tipo && anexo.tipo.trim() !== '';

            if ((arquivoPreenchido && !tipoPreenchido) || (!arquivoPreenchido && tipoPreenchido)) {
                tudoOk = false;

                this.errosAnexos[i] = {
                arquivo: !arquivoPreenchido,
                tipo: !tipoPreenchido
                };
            }
        }

        return tudoOk;
    }

    // Função de selecionar o arquivo anexado

    selecionarArquivo(event: any, index: number) {
        const arquivoSelecionado = event.target.files[0];
        this.anexos[index].arquivo = arquivoSelecionado;
        this.anexos[index].nomeArquivo = arquivoSelecionado ? arquivoSelecionado.name : undefined;
        console.log(`Arquivo ${index + 1}:`, arquivoSelecionado);
    }

    // Função para abrir a camera ou galeria

    async abrirCameraOuGaleria(index: number) {
        // Está rodando em app nativo (Android/IOS)

        if ((window as any).Capacitor?.isNativePlatform()) {
            try {
                const image = await Camera.getPhoto({
                quality: 80,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Prompt,
                });

                const arquivo = this.base64ToFile(image.dataUrl!, `anexo-${index + 1}.jpg`);
                this.anexos[index].arquivo = arquivo;
                this.anexos[index].nomeArquivo = arquivo.name;
                this.errosAnexos[index].arquivo = false;

                console.log(`Arquivo capturado pelo Capacitor no celular:`, arquivo);
            } catch (error) {
                console.warn('Captura cancelada ou erro:', error);
            }
        } else {
            // Navegador -> simula uma imagem base64 como se fosse da câmera

            const response = await fetch('https://picsum.photos/400'); // Exemplo de imagem
            const blob = await response.blob();
            const arquivo = new File([blob], `simulado-${index + 1}.jpg`, { type: blob.type });

            this.anexos[index].arquivo = arquivo;
            this.anexos[index].nomeArquivo = arquivo.name;
            this.errosAnexos[index].arquivo = false;

            console.log(`Arquivo SIMULADO no navegador:`, arquivo);
        }
    }

    limparValor(valor: string): string {
        if (!valor || typeof valor !== 'string') {
            return '';
        }
        return valor.replace(/R\$\s*/g, '').replace(/\s+/g, '');
    }



    // Remover um anexo

    removerAnexo(index: number) {
        this.anexos[index].arquivo = null;
        this.anexos[index].nomeArquivo = undefined; 
        this.anexos[index].tipo = ''; 
        this.errosAnexos[index] = { arquivo: false, tipo: false }; 
    }

    // Converter base64 para arquivo

    base64ToFile(dataUrl: string, filename: string): File {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], filename, { type: mime });
    }

    // Função de cadastrar a proposta

    async cadastrarProposta() {
        const anexosValidos = this.validarAnexos();

        this.erroContratoOnline = this.contratoOnline === '';

        const codigoBoleto: any = {};

        if (!anexosValidos || this.erroContratoOnline) return;

        await this.showLoading('Cadastrando proposta...');

        const anexosCompletos = this.anexos.filter(anexo => anexo.arquivo && anexo.tipo && anexo.tipo.trim() !== '').map(anexo => ({
            nomeArquivo: anexo.arquivo!.name,
            tipo: anexo.tipo
        }));

        const dadosOriginais = JSON.parse(localStorage.getItem('dados') || '{}');

        (dadosOriginais.boletos || []).forEach((boleto: string, index: number) => {
            const nomeCampo = `codigoBoleto${index + 1}`;
            codigoBoleto[nomeCampo] = boleto; 
        });

        // Monta o objeto etapa5

        const etapa5: any = {
            terceiroConta: dadosOriginais.terceiroConta || 0
        };

        if(dadosOriginais.tipoRecebimento === 'banco'){
            etapa5.banco = dadosOriginais.banco;
            etapa5.ContaAgencia = dadosOriginais.agencia;
            etapa5.ContaCorrente = dadosOriginais.conta;
            etapa5.ContaDigito = dadosOriginais.digito;
            etapa5.tipoConta = dadosOriginais.tipoConta;
        }

        if(dadosOriginais.tipoRecebimento === 'pix'){
            etapa5.tipoChave = dadosOriginais.tipoChave;
            etapa5.chavePix = dadosOriginais.chave;
        }

        if (dadosOriginais.terceiroConta === 1 && dadosOriginais.tipoTerceiro === 'pf') {
            etapa5.nomeTerceiro = dadosOriginais.nomeTerceiro;
            etapa5.cpfTerceiro = dadosOriginais.cpfTerceiro;
            etapa5.parentesco = dadosOriginais.parentescoTerceiro;

            if(etapa5.parentesco === 'outros'){
                etapa5.parentescoOutros = dadosOriginais.outrosParentesco;
            }
        }

        if (dadosOriginais.terceiroConta === 1 && dadosOriginais.tipoTerceiro === 'pj') {
            etapa5.nomeTerceiro = dadosOriginais.razaoSocialTerceiro;
            etapa5.cpfTerceiro = dadosOriginais.cnpjTerceiro;
            etapa5.parentesco = dadosOriginais.vinculoTerceiro;
        }

        const dadosTransformados = {
            auth_hash: AUTH_HASH,
            etapa1: {
                idProposta: 0,
                tipo: dadosOriginais.tipo,
                tipoDescricao: dadosOriginais.tabela,
                tipoOperacaoCC: dadosOriginais.tipoOperacao,
                valorFinanciado: this.limparValor(dadosOriginais.valor),
                codigoBoleto: codigoBoleto,
                tipoPixFacil: dadosOriginais.tipoPixFacil
            },
            etapa2: {
                quantPrestacoes: parseInt(dadosOriginais.prazo || '0', 10),
                valorTotal: this.limparValor(dadosOriginais.valorTotal) || this.limparValor(dadosOriginais.valor),
                valorPacela: this.limparValor(dadosOriginais.valorParcela) || '' 
            },
            etapa3: {
                cpf: dadosOriginais.cpf,
                nome: dadosOriginais.nomeCompleto,
                rg: dadosOriginais.rg,
                naturalidade: dadosOriginais.naturalidade,
                nomePai: dadosOriginais.nomePai,
                nomeMae: dadosOriginais.nomeMae,
                dataNascimento: dadosOriginais.dataNascimento,
                sexo: dadosOriginais.sexo || '',
                telefone: dadosOriginais.whatsapp,
                celular: dadosOriginais.celular,
                email: dadosOriginais.email,
                bandeiraCartao: dadosOriginais.bandeiraCartao,
                numeroCartao: dadosOriginais.digitosCartao,
                atividade: dadosOriginais.atividade,
                profissaoCargo: dadosOriginais.profissao,
                empresa: dadosOriginais.empresa,
                salario: this.limparValor(dadosOriginais.salario) || '',
                tempoEmpresa: dadosOriginais.tempoEmpresa,
                dataInicioEmpresa: dadosOriginais.dataInicio,
                telefoneEmpresa: dadosOriginais.telefoneEmpresa,
                cnpj: dadosOriginais.cnpj,
                outrasAtividades: dadosOriginais.outrasAtividades,
                numeroBeneficio: dadosOriginais.numBeneficio,
                especieBeneficio: dadosOriginais.especieBeneficio,
                valorBeneficio: this.limparValor(dadosOriginais.valorBeneficio) || '',
                nomeReferencia1: dadosOriginais.nomeReferencia || '',
                afinidadeReferencia1: dadosOriginais.afinidadeReferencia || '',
                telefoneReferencia1: dadosOriginais.telefoneReferencia || '',
                celularReferencia1: dadosOriginais.celularReferencia || ''
            },
            etapa4: {
                cepEndereco: dadosOriginais.cep,
                endereco: dadosOriginais.rua,
                numEndereco: dadosOriginais.numero,
                compEndereco: dadosOriginais.complemento,
                bairroEndereco: dadosOriginais.bairro,
                cidadeEndereco: dadosOriginais.cidade,
                estadoEndereco: dadosOriginais.estado,
                enderecoEmpresa: dadosOriginais.enderecoEmpresa || '',
                numEnderecoEmpresa: dadosOriginais.numEnderecoEmpresa || '',
                compEnderecoEmpresa: dadosOriginais.compEnderecoEmpresa || '',
                bairroEmpresa: dadosOriginais.bairroEmpresa || '',
                cepEmpresa: dadosOriginais.cepEmpresa || '',
                estadoEmpresa: dadosOriginais.estadoEmpresa || '',
                cidadeEmpresa: dadosOriginais.cidadeEmpresa || ''
            },
            etapa5: etapa5, 
            etapa6: {
                contratoOnline: this.contratoOnline 
            },
            dadosUser: {
                idUser: localStorage.getItem('idLogado'),
                nomeLogado: localStorage.getItem('nomeLogado'),
                idRepresentante: localStorage.getItem('idRepresentante'),
                representante: localStorage.getItem('representante'),
                idCorrespondente: localStorage.getItem('idCorrespondente'),
                correspondente: localStorage.getItem('correspondente'),
                idMaster: localStorage.getItem('idMaster'),
                master: localStorage.getItem('master'),
                idFranqueado: localStorage.getItem('idFranqueado'),
                franqueado: localStorage.getItem('franqueado'),
                idGerente: localStorage.getItem('idGerente'),
                gerente: localStorage.getItem('gerente'),
                idPonto: localStorage.getItem('idPonto'),
                nomePonto: localStorage.getItem('nomePonto')
            }
        };

        this.apiService.cadProposta(dadosTransformados).subscribe({
            next: async (response) => {
                if (response.estatus === 'erro') {
                    this.alert(response.mensagem);
                } else {
                    const idProposta = response.idProposta || 0;

                    if (idProposta) {
                        this.enviarAnexosAoServidor(idProposta);
                    } else {
                        await this.hideLoading();
                        this.alert('Proposta cadastrada, mas sem ID retornado.');
                    }
                }
            },
            error: () => {
                this.hideLoading();
                this.alert('Erro na conexão.');
            }
        });
    }

    // Função para enviar os anexos

    async enviarAnexosAoServidor(idProposta: number) {
        const idUser = localStorage.getItem('idLogado') || '';

        const nomeLogado = localStorage.getItem('nomeLogado') || '';

        const anexosValidos = this.anexos.filter(anexo => anexo.arquivo && anexo.tipo && anexo.tipo.trim() !== '');

        try {
            const promises = anexosValidos.map(async (anexo, index) => {
                const formData = new FormData();
                formData.append('arquivo', anexo.arquivo!);
                formData.append('tipoAnexo', anexo.tipo);
                formData.append('idProposta', idProposta.toString());
                formData.append('idUser', idUser);
                formData.append('nomeLogado', nomeLogado);
                formData.append('auth_hash', AUTH_HASH);

                return await firstValueFrom(this.apiService.S3Upload(formData));
            });

            await Promise.all(promises);
            console.log('Todos os anexos foram enviados com sucesso.');

            await this.hideLoading();
            this.mostrarModalSucesso();

        } catch (err) {
            console.error('Erro ao enviar um ou mais anexos:', err);
            await this.hideLoading();
            this.alert('Erro ao enviar anexos.');
        }
    }

    // Função de alert

    async alert(mensagem: string) {
        const alert = await this.alertController.create({
            header: 'AVISO',
            message: mensagem,
            buttons: ['OK'],
        });
        await alert.present();
    }

    // Função de redirecionamento

    voltar() {
        const dados = localStorage.getItem('dados');
        const tipo = dados ? JSON.parse(dados).tipo : '';

        if (tipo === 'Cartão de Crédito - Boleto') {
            this.navigation('simulador/endereco');
        } else if(tipo === 'Crédito Consignado') {
            this.navigation('simulador/cadastro');
        } else {
            this.navigation('simulador/banco');
        }
    }

    navigation(page: string) {
        this.navigationService.navigate(page);
    }

    // Funções de comportamento do modal

    async showLoading(message = 'Processando...') {
        this.loading = await this.loadingController.create({
            spinner: 'dots',
            message,
            cssClass: 'custom-loading',
            backdropDismiss: false
        });
        await this.loading.present();
    }

    async hideLoading() {
        if (this.loading) {
            await this.loading.dismiss();
            this.loading = null;
        }
    }

    // Função de abrir o modal

    async mostrarModalSucesso() {
        const modal = await this.modalController.create({
            component: SuccessModalComponent,
            cssClass: 'success-modal-style',
            backdropDismiss: false 
        });

        await modal.present();

        // O evento onDidDismiss é disparado QUANDO o modal é fechado

        await modal.onDidDismiss();

        // Apenas depois que o modal for fechado, navegue para a próxima página

        this.navigation('index');
    }
}