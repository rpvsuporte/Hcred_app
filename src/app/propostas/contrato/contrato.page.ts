import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { AUTH_HASH } from 'src/app/services/auth-config';
import { ToastService } from 'src/app/services/toast.service';

@Component({
    selector: 'app-contrato',
    templateUrl: './contrato.page.html',
    styleUrls: ['./contrato.page.scss'],
    standalone: false
})
export class ContratoPage implements OnInit {

    // Variáveis Iniciais

    proposta: any = {};
    loja: string = localStorage.getItem('franqueado') ?? '';
    isLoading: boolean = false;

    constructor(private apiService: ApiService, private navigationService: NavigationService, private toastService: ToastService) { }

    ngOnInit() {
        this.dataAtualExtenso = this.getDataAtualExtenso('AVARÉ');
        this.realizarBusca();
    }

    // Função para buscar os dados do contrato

    realizarBusca(){
        this.isLoading = true;

        const data = {
            auth_hash: AUTH_HASH,
            idProposta: localStorage.getItem('idProposta'),
            idUser: localStorage.getItem("idLogado")
        };

        this.apiService.listarContrato(data).subscribe({
            next: (response) => {
                if (response.estatus === 'erro') {
                    this.toastService.error(response.mensagem); // <-- substituído
                } else {
                    this.proposta = response.resultado;
                }

                this.isLoading = false;
            },
            error: () => {
                this.isLoading = false;
                this.toastService.error('Erro na conexão.'); // <-- substituído
            }
        });

    }

    // Função para formatar data

    formatarData(data: string): string {
        if (!data) return '';
        const partes = data.split('-'); 
        if (partes.length !== 3) return data;
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    // Função para informar o valor por extenso

    valorPorExtenso(valor: string | number): string {
        const unidades = [
            '', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'
        ];
        const especiais = [
            'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'
        ];
        const dezenas = [
            '', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'
        ];
        const centenas = [
            '', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'
        ];

        if (typeof valor === 'string') {
            valor = parseFloat(valor.replace('.', '').replace(',', '.'));
        }

        if (isNaN(valor)) return '';

        let inteiro = Math.floor(valor);
        let centavos = Math.round((valor - inteiro) * 100);

        const extensoInteiro = this.numeroPorExtenso(inteiro, unidades, especiais, dezenas, centenas);
        const extensoCentavos = centavos > 0
        ? ` e ${this.numeroPorExtenso(centavos, unidades, especiais, dezenas, centenas)} centavos`
        : '';

        return `${extensoInteiro} ${inteiro === 1 ? 'real' : 'reais'}${extensoCentavos}`;

    }

    private numeroPorExtenso(n: number, unidades: string[], especiais: string[], dezenas: string[], centenas: string[]): string {
        if (n === 0) return 'zero';
        if (n > 999999) return 'valor muito alto';

        const milhares = Math.floor(n / 1000);
        const resto = n % 1000;
        let partes: string[] = [];

        if (milhares > 0) {
            if (milhares === 1) {
                partes.push('mil');
            } else {
                partes.push(`${this.numeroPorExtenso(milhares, unidades, especiais, dezenas, centenas)} mil`);
            }
        }

        if (resto > 0) {
            if (resto < 10) {
                partes.push(unidades[resto]);
            } else if (resto < 20) {
                partes.push(especiais[resto - 10]);
            } else if (resto < 100) {
                const dez = Math.floor(resto / 10);
                const uni = resto % 10;
                partes.push(dezenas[dez] + (uni > 0 ? ` e ${unidades[uni]}` : ''));
            } else {
                const cen = Math.floor(resto / 100);
                const dezUni = resto % 100;
                if (resto === 100) {
                    partes.push('cem');
                } else {
                    let texto = centenas[cen];
                    if (dezUni > 0) {
                        texto += ` e ${this.numeroPorExtenso(dezUni, unidades, especiais, dezenas, centenas)}`;
                    }
                    partes.push(texto);
                }
            }
        }
        return partes.join(' e ');
    }

    // Função para pegar data atual por extens e cidade

    public dataAtualExtenso: string = '';

    getDataAtualExtenso(cidade: string): string {
        const meses = [
            'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
            'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
        ];

        const hoje = new Date();
        const dia = hoje.getDate().toString().padStart(2, '0');
        const mes = meses[hoje.getMonth()];
        const ano = hoje.getFullYear();

        return `${cidade.toUpperCase()}, ${dia} DE ${mes} DE ${ano}`;
    }

    navigation(page: string, estatus?: string) {
        this.navigationService.navigate(page, estatus || '');
    }
}
