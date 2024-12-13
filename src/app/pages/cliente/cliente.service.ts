import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ClienteCNPJ } from './cliente-criar-novo/clienteCNPJ.model';
import { Sintegra } from './cliente-criar-novo/sintegra.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private cnpjApiUrl = `${environment.apiBaseUrl}/someli/api/consultaCNPJ`;
  private sintegraApiUrl = `${environment.apiBaseUrl}/someli/api/sintegra`;

  constructor(private http: HttpClient) {}

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
}

  