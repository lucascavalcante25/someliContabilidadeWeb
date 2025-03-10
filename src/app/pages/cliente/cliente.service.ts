import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ClienteCNPJ } from './cliente-consultar-novo/clienteCNPJ.model';
import { Sintegra } from './cliente-consultar-novo/sintegra.model';
import { Cliente } from './cliente-listar/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private cnpjApiUrl = `${environment.apiBaseUrl}/someli/api/consultaCNPJ`;
  private sintegraApiUrl = `${environment.apiBaseUrl}/someli/api/sintegra`;
  private clienteApiUrl = `${environment.apiBaseUrl}/someli/cliente`;


  constructor(private http: HttpClient) { }

  /**
   * Consulta detalhes do CNPJ usando o endpoint de consultaCNPJ
   * @param cnpj Número do CNPJ
   * @returns Observable com os dados do CNPJ
   */
  consultarClientePorCNPJ(cnpj: string): Observable<ClienteCNPJ> {
    return this.http.get<ClienteCNPJ>(`${this.cnpjApiUrl}/${cnpj}`);
  }

  /**
   * Consulta dados no Sintegra usando o endpoint de sintegra/consulta
   * @param cnpj Número do CNPJ
   * @param uf Unidade Federativa (UF)
   * @returns Observable com os dados do Sintegra
   */
  consultarSintegra(cnpj: string, uf: string): Observable<Sintegra> {
    return this.http.post<Sintegra>(`${this.sintegraApiUrl}/consulta`, { cnpj, uf });
  }

  salvarCliente(cliente: any): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.clienteApiUrl}/salvarCliente`, cliente);
  }

  getListaDeClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.clienteApiUrl}/listarClientes`);
  }

}

