import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { NavigationService } from '../../services/navigation.service';
import { SuccessModalComponent } from 'src/app/components/success-modal/success-modal.component';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AUTH_HASH } from 'src/app/services/auth-config';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../services/toast.service';

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
    anexos: Anexo[] = Array(4).fill({ arquivo: null, tipo: '' });
    errosAnexos: { arquivo: boolean; tipo: boolean }[] = Array(4).fill({ arquivo: false, tipo: false });
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

    loading: HTMLIonLoadingElement | null = null;

    constructor(
        private navCtrl: NavController,
        private apiService: ApiService,
        private navigationService: NavigationService,
        private modalController: ModalController,
        private loadingController: LoadingController,
        private toastService: ToastService
    ) { }

    ngOnInit() { }

    validarAnexos(): boolean {
        let tudoOk = true;
        this.errosAnexos = this.anexos.map(() => ({ arquivo: false, tipo: false }));

        for (let i = 0; i < this.anexos.length; i++) {
            const anexo = this.anexos[i];
            const arquivoPreenchido = !!anexo.arquivo;
            const tipoPreenchido = !!anexo.tipo && anexo.tipo.trim() !== '';

            if ((arquivoPreenchido && !tipoPreenchido) || (!arquivoPreenchido && tipoPreenchido)) {
                tudoOk = false;
                this.errosAnexos[i] = { arquivo: !arquivoPreenchido, tipo: !tipoPreenchido };
                this.toastService.warning(`Anexo ${i + 1}: preencha arquivo e tipo corretamente.`);
            }
        }

        return tudoOk;
    }

    selecionarArquivo(event: any, index: number) {
        const arquivoSelecionado = event.target.files[0];
        this.anexos[index].arquivo = arquivoSelecionado;
        this.anexos[index].nomeArquivo = arquivoSelecionado ? arquivoSelecionado.name : undefined;
    }

    async abrirCameraOuGaleria(index: number) {
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

            } catch (error) {
                console.warn('Captura cancelada ou erro:', error);
            }
        } else {
            const response = await fetch('https://picsum.photos/400');
            const blob = await response.blob();
            const arquivo = new File([blob], `simulado-${index + 1}.jpg`, { type: blob.type });
            this.anexos[index].arquivo = arquivo;
            this.anexos[index].nomeArquivo = arquivo.name;
            this.errosAnexos[index].arquivo = false;
        }
    }

    limparValor(valor: string): string {
        return valor?.replace(/R\$\s*/g, '').replace(/\s+/g, '') || '';
    }

    removerAnexo(index: number) {
        this.anexos[index] = { arquivo: null, tipo: '' };
        this.errosAnexos[index] = { arquivo: false, tipo: false };
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

    async cadastrarProposta() {
        const anexosValidos = this.validarAnexos();
        this.erroContratoOnline = this.contratoOnline === '';

        if (!anexosValidos || this.erroContratoOnline) {
            if (this.erroContratoOnline) this.toastService.warning('Informe o contrato online.');
            return;
        }

        await this.showLoading('Cadastrando proposta...');

        const dadosOriginais = JSON.parse(localStorage.getItem('dados') || '{}');
        const anexosCompletos = this.anexos.filter(a => a.arquivo && a.tipo).map(a => ({
            nomeArquivo: a.arquivo!.name,
            tipo: a.tipo
        }));

        const codigoBoleto: any = {};
        (dadosOriginais.boletos || []).forEach((boleto: string, index: number) => {
            codigoBoleto[`codigoBoleto${index + 1}`] = boleto;
        });

        const etapa5: any = { terceiroConta: dadosOriginais.terceiroConta || 0 };
        if (dadosOriginais.tipoRecebimento === 'banco') {
            Object.assign(etapa5, {
                banco: dadosOriginais.banco,
                ContaAgencia: dadosOriginais.agencia,
                ContaCorrente: dadosOriginais.conta,
                ContaDigito: dadosOriginais.digito,
                tipoConta: dadosOriginais.tipoConta
            });
        }
        if (dadosOriginais.tipoRecebimento === 'pix') {
            Object.assign(etapa5, {
                tipoChave: dadosOriginais.tipoChave,
                chavePix: dadosOriginais.chave
            });
        }

        if (dadosOriginais.terceiroConta === 1) {
            if (dadosOriginais.tipoTerceiro === 'pf') {
                Object.assign(etapa5, {
                    nomeTerceiro: dadosOriginais.nomeTerceiro,
                    cpfTerceiro: dadosOriginais.cpfTerceiro,
                    parentesco: dadosOriginais.parentescoTerceiro
                });
                if (etapa5.parentesco === 'outros') etapa5.parentescoOutros = dadosOriginais.outrosParentesco;
            }
            if (dadosOriginais.tipoTerceiro === 'pj') {
                Object.assign(etapa5, {
                    nomeTerceiro: dadosOriginais.razaoSocialTerceiro,
                    cpfTerceiro: dadosOriginais.cnpjTerceiro,
                    parentesco: dadosOriginais.vinculoTerceiro
                });
            }
        }

        const dadosTransformados = {
            auth_hash: AUTH_HASH,
            etapa1: { idProposta: 0, tipo: dadosOriginais.tipo, tipoDescricao: dadosOriginais.tabela, tipoOperacaoCC: dadosOriginais.tipoOperacao, valorFinanciado: this.limparValor(dadosOriginais.valor), codigoBoleto, tipoPixFacil: dadosOriginais.tipoPixFacil },
            etapa2: { quantPrestacoes: parseInt(dadosOriginais.prazo || '0', 10), valorTotal: this.limparValor(dadosOriginais.valorTotal) || this.limparValor(dadosOriginais.valor), valorPacela: this.limparValor(dadosOriginais.valorParcela) || '' },
            etapa3: { cpf: dadosOriginais.cpf, nome: dadosOriginais.nomeCompleto, rg: dadosOriginais.rg, telefone: dadosOriginais.whatsapp, celular: dadosOriginais.celular, email: dadosOriginais.email },
            etapa4: { cepEndereco: dadosOriginais.cep, endereco: dadosOriginais.rua },
            etapa5,
            etapa6: { contratoOnline: this.contratoOnline },
            dadosUser: { idUser: localStorage.getItem('idLogado') }
        };

        this.apiService.cadProposta(dadosTransformados).subscribe({
            next: async (response) => {
                if (response.estatus === 'erro') {
                    this.toastService.error(response.mensagem);
                } else {
                    const idProposta = response.idProposta || 0;
                    if (idProposta) {
                        this.enviarAnexosAoServidor(idProposta);
                    } else {
                        await this.hideLoading();
                        this.toastService.warning('Proposta cadastrada, mas sem ID retornado.');
                    }
                }
            },
            error: async () => {
                await this.hideLoading();
                this.toastService.error('Erro na conexão.');
            }
        });
    }

    async enviarAnexosAoServidor(idProposta: number) {
        const idUser = localStorage.getItem('idLogado') || '';
        const nomeLogado = localStorage.getItem('nomeLogado') || '';
        const anexosValidos = this.anexos.filter(a => a.arquivo && a.tipo && a.tipo.trim() !== '');

        try {
            const promises = anexosValidos.map(async (anexo) => {
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
            await this.hideLoading();
            this.mostrarModalSucesso();

        } catch (err) {
            await this.hideLoading();
            this.toastService.error('Erro ao enviar anexos.');
        }
    }

    voltar() {
        const dados = localStorage.getItem('dados');
        const tipo = dados ? JSON.parse(dados).tipo : '';
        if (tipo === 'Cartão de Crédito - Boleto') this.navigation('simulador/endereco');
        else if (tipo === 'Crédito Consignado') this.navigation('simulador/cadastro');
        else this.navigation('simulador/banco');
    }

    navigation(page: string) {
        this.navigationService.navigate(page);
    }

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

    async mostrarModalSucesso() {
        const modal = await this.modalController.create({
            component: SuccessModalComponent,
            cssClass: 'success-modal-style',
            backdropDismiss: false
        });

        await modal.present();
        await modal.onDidDismiss();
        this.navigation('index');
    }
}
