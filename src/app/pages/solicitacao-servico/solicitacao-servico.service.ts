import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SolicitacaoServico } from './solicitacao-servico.model';
import { Veiculo } from '../cliente/cliente-listar/cliente.model';
import { SolicitacaoServicoCompletaDTO } from './solicitacao-detalhes-vistoria/solicitacao-detalhes-vistoria.model';
import { PessoaJuridicaDTO } from './pessoaFisicaJuridica';
import { Motorista } from '../motorista/motorista.model';
import { VistoriaSolicitacaoDTO } from './vistoriaSolicitacaoDTO.model';

@Injectable({
  providedIn: 'root'
})
export class SolicitacaoServicoService {

  private apiUrl = `${environment.apiBaseUrl}/solicitacaoServico`;

  constructor(private http: HttpClient, private router: Router) { }

  getListaDeOrdens(): Observable<SolicitacaoServico[]> {
    return this.http.get<SolicitacaoServico[]>(`${this.apiUrl}/listarSolicitacaoServico`);
  }

  buscarVeiculoPorPlaca(placa: string): Observable<Veiculo> {
    return this.http.get<Veiculo>(`${this.apiUrl}/buscarPorPlaca/${placa}`);
  }

  cadastrarSolicitacaoServico(solicitacao: SolicitacaoServico): Observable<SolicitacaoServico> {
    return this.http.post<SolicitacaoServico>(`${this.apiUrl}/cadastrarSolicitacaoServico`, solicitacao);
  }

  buscarPorId(id: number): Observable<SolicitacaoServicoCompletaDTO> {
    return this.http.get<SolicitacaoServicoCompletaDTO>(`${this.apiUrl}/buscaSolicitacaoServico/${id}`);
  }

  consultarPessoaJuridica(cnpj: string): Observable<PessoaJuridicaDTO> {
    return this.http.get<PessoaJuridicaDTO>(`${environment.apiBaseUrl}/vistoria-solicitacao/consultarPessoaJuridica/${cnpj}?apikey=nkTx3mN2wIIe459w9jwoHEjW4Io84vne`);
  }

  listarOrdensSemVeiculo(): Observable<Motorista[]> {
    return this.http.get<Motorista[]>(`${environment.apiBaseUrl}/motorista/listarMotoristasSemVinculo`);
  }

  cadastrarVistoriaSolicitacao(vistoria: VistoriaSolicitacaoDTO): Observable<VistoriaSolicitacaoDTO> {
    return this.http.post<VistoriaSolicitacaoDTO>(`${environment.apiBaseUrl}/vistoria-solicitacao/cadastrarVistoriaSolicitacao`, vistoria);
  }

  excluirSolicitacao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/excluirSolicitacao/${id}`);
  }

  editarSolicitacaoServico(id: number, solicitacaoServico: SolicitacaoServicoCompletaDTO): Observable<SolicitacaoServicoCompletaDTO> {
    return this.http.put<SolicitacaoServicoCompletaDTO>(`${this.apiUrl}/editarSolicitacaoServico/${id}`, solicitacaoServico);
  }
}
