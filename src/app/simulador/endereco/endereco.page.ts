// endereco.page.ts

import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service'; 
import { NavigationService } from '../../services/navigation.service';
import { AUTH_HASH } from 'src/app/services/auth-config';

@Component({
    selector: 'app-endereco',
    templateUrl: './endereco.page.html',
    styleUrls: ['./endereco.page.scss'],
    standalone: false
}) 
export class EnderecoPage implements OnInit {

    // Variáveis iniciais
    
    public endereco = {
        cep: '',
        rua: '',
        numero: '',
        complemento: '', 
        bairro: '',
        cidade: '',
        estado: ''
    };

    // Objeto para controlar os erros dos campos

    public errosCampos: { [key: string]: boolean } = {};

    constructor(
        private apiService: ApiService,
        private navigationService: NavigationService,
        private toastService: ToastService 
    ) { }

    ngOnInit() {
        this.carregarEnderecoSalvo();
    }

    // Função para formatar o CEP

    formatarCEP(event: any) {
        let valor = event.target.value.replace(/\D/g, '');
        valor = valor.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
        event.target.value = valor;
        this.endereco.cep = valor;
    }

    // Função com integração da API dos Correios

    buscarEnderecoPorCep() {
        const cepLimpo = this.endereco.cep.replace(/\D/g, '');
        
        if (cepLimpo.length !== 8) {
            this.toastService.error('CEP inválido.');
            return;
        }

        fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
        .then(res => res.json())
        .then(dados => {
            if (dados.erro) {
                this.endereco.rua = '';
                this.endereco.bairro = '';
                this.endereco.cidade = '';
                this.endereco.estado = '';
                this.toastService.error('CEP não encontrado.');
                return;
            }
            this.endereco.rua = dados.logradouro || '';
            this.endereco.bairro = dados.bairro || '';
            this.endereco.cidade = dados.localidade || '';
            this.endereco.estado = dados.uf || '';
            this.validarCampos();
        })
        .catch(err => {
            this.toastService.error('Erro na consulta do CEP.');
            console.error('Erro na consulta do CEP:', err);
        });
    }

    // Função para validar os campos digitados

    validarCampos(): boolean {
        this.errosCampos = {}; 
        const camposObrigatorios: (keyof typeof this.endereco)[] = ['cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'];
        let formularioValido = true;

        for (const campo of camposObrigatorios) {
            if (!this.endereco[campo] || this.endereco[campo].trim() === '') {
                this.errosCampos[campo] = true;
                formularioValido = false;
            }
        }

        if (!formularioValido) {
            this.toastService.error('Preencha todos os campos obrigatórios.');
        }

        return formularioValido;
    }

    // Função para salvar o endereço no localtStorage

    salvarEnderecoNoLocalStorage() {
        try {
            const dadosAntigos = JSON.parse(localStorage.getItem('dados') || '{}');
            const dadosAtualizados = {
                ...dadosAntigos,
                ...this.endereco 
            };

            localStorage.setItem('dados', JSON.stringify(dadosAtualizados));
        } catch (e) {
            this.toastService.error('Erro ao salvar endereço.');
            console.error('Erro ao salvar endereço no localStorage:', e);
        }
    }

    // Função para carregar os dados do endereço caso já preenchidos

    carregarEnderecoSalvo() {
        try {
            const dadosCliente = JSON.parse(localStorage.getItem('dadosCliente') || '{}');

            if (dadosCliente && Object.keys(dadosCliente).length > 0) {
                this.endereco.cep = dadosCliente.cepEndereco || '';
                this.endereco.rua = dadosCliente.endereco || '';
                this.endereco.numero = dadosCliente.numEndereco || '';
                this.endereco.complemento = dadosCliente.compEndereco || '';
                this.endereco.bairro = dadosCliente.bairroEndereco || '';
                this.endereco.cidade = dadosCliente.cidadeEndereco || '';
                this.endereco.estado = dadosCliente.estadoEndereco || '';
            }
        } catch (e) {
            this.toastService.error('Erro ao carregar endereço.');
            console.error('Erro ao carregar endereço do localStorage:', e);
        }
    }

    // Função de ir para próxima página

    avancar() {
        if (this.validarCampos()) {
            this.salvarEnderecoNoLocalStorage();

            const dados = localStorage.getItem('dados');
            const tipo = dados ? JSON.parse(dados).tipo : '';

            if (tipo === 'Cartão de Crédito - Boleto') {
                this.navigation('simulador/anexos');
            } else {
                this.navigation('simulador/banco');
            }
        } else {
            this.toastService.error('Formulário inválido. Preencha todos os campos obrigatórios.');
        }
    }

    // Função de redirecionamento

    navigation(page: string) {
        this.navigationService.navigate(page);
    }
}
