import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

    // private apiHcred: string = 'https://lojas.hcred.com.br/API/';
    private apiHcred: string = 'https://hcred.rpvtecnologia.com.br/API/';

    private options = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=UTF-8' }),
        responseType: 'json' as const 
    };

    constructor(private http: HttpClient) { }

    atualizarSenha(data: any){
        return this.http.post<any>(`${this.apiHcred}atualizar_senha.php`, JSON.stringify(data), this.options);
    }

    buscaBanks(data: any){
        return this.http.post<any>(`${this.apiHcred}selectBanks.php`, JSON.stringify(data), this.options);
    }

    buscaContas(data: any){
        return this.http.post<any>(`${this.apiHcred}listarConta.php`, JSON.stringify(data), this.options);
    }

    buscaContasAll(data: any){
        return this.http.post<any>(`${this.apiHcred}listarContaAll.php`, JSON.stringify(data), this.options);
    }

    buscaPropsAll(data: any){
        return this.http.post<any>(`${this.apiHcred}selectPropsAll.php`, JSON.stringify(data), this.options);
    }

    buscaPropsFilter(data: any){
        return this.http.post<any>(`${this.apiHcred}selectPropsFilter.php`, JSON.stringify(data), this.options);
    }

    buscaPropsProv(data: any){
        return this.http.post<any>(`${this.apiHcred}selectProps.php`, JSON.stringify(data), this.options);
    }

    buscaPropsRelatorios(data: any){
        return this.http.post<any>(`${this.apiHcred}listarRelatorios.php`, JSON.stringify(data), this.options);
    }

    buscaPropsStatus(data: any){
        return this.http.post<any>(`${this.apiHcred}listarPropsStatus.php`, JSON.stringify(data), this.options);
    }

    buscaTabelas(data: any) {
        return this.http.post<any>(`${this.apiHcred}selectTabela.php`, JSON.stringify(data), this.options);
    }

    buscaTipo(data: any) {
        return this.http.post<any>(`${this.apiHcred}selectTipo.php`, JSON.stringify(data), this.options);
    }

    cadPropsView(data: any){
        return this.http.post<any>(`${this.apiHcred}cad_propsView.php`, JSON.stringify(data), this.options);
    }

    cadProposta(data: any){
        return this.http.post<any>(`${this.apiHcred}cadProposta.php`, JSON.stringify(data), this.options);
    }

    consultaCPF(data: any){
        return this.http.post<any>(`${this.apiHcred}consultaCPF.php`, JSON.stringify(data), this.options);
    }

    countProps(data: any){
        return this.http.post<any>(`${this.apiHcred}countProps.php`, JSON.stringify(data), this.options);
    }

    criaCards(data: any){
        return this.http.post<any>(`${this.apiHcred}selectTabelaCartao.php`, JSON.stringify(data), this.options);
    }

    criaParcelas(data: any){
        return this.http.post<any>(`${this.apiHcred}criarParcelas.php`, JSON.stringify(data), this.options);
    }

    deletePropsView(data: any){
        return this.http.post<any>(`${this.apiHcred}delete_propsView.php`, JSON.stringify(data), this.options);
    }

    enviarDadosAlteracao(data: any){
        return this.http.post<any>(`${this.apiHcred}alterarProposta.php`, JSON.stringify(data), this.options);
    }

    gerarLink(data: any){
        return this.http.post<any>(`${this.apiHcred}cad_session.php`, JSON.stringify(data), this.options);
    }

    gerarRelatorio(data: any){
        return this.http.post<any>(`${this.apiHcred}gerarRelatorio.php`, JSON.stringify(data), this.options);
    }

    listarContrato(data: any){
        return this.http.post<any>(`${this.apiHcred}listarContrato.php`, JSON.stringify(data), this.options);
    }

    listarOperadoras(data: any){
        return this.http.post<any>(`${this.apiHcred}listarOperadoras.php`, JSON.stringify(data), this.options);
    }

    listarSaldo(data: any) {
        return this.http.post<any>(`${this.apiHcred}listarSaldo.php`, JSON.stringify(data), this.options);
    }

    loginApp(data: any) {
        return this.http.post<any>(`${this.apiHcred}logar.php`, JSON.stringify(data), this.options);
    }

    sacar(data: any){
        return this.http.post<any>(`${this.apiHcred}sacar.php`, JSON.stringify(data), this.options);
    }

    S3Upload(data: any){
        return this.http.post<any>(`${this.apiHcred}S3Upload.php`, data);
    }

    validarBoleto(data: any){
        return this.http.post<any>(`${this.apiHcred}validarBoleto.php`, JSON.stringify(data), this.options);
    }

    verificarPropsView(data: any){
        return this.http.post<any>(`${this.apiHcred}verificarPropsView.php`, JSON.stringify(data), this.options);
    }
}
