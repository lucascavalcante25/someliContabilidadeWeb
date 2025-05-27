import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Despesa } from './despesa.model';

@Injectable({ providedIn: 'root' })
export class DespesaService {
  private despesaApiUrl = `${environment.apiBaseUrl}/api/despesas`;

  constructor(private http: HttpClient) { }

  salvar(despesa: Despesa): Observable<Despesa> {
    return this.http.post<Despesa>(this.despesaApiUrl, despesa);
  }

  listar(): Observable<Despesa[]> {
    return this.http.get<Despesa[]>(this.despesaApiUrl);
  }

  buscarPorId(id: number): Observable<Despesa> {
    return this.http.get<Despesa>(`${this.despesaApiUrl}/${id}`);
  }

  inativar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.despesaApiUrl}/${id}/inativar`, {});
  }

  editar(id: number, despesa: any): Observable<any> {
    return this.http.put(`${this.despesaApiUrl}/${id}`, despesa);
  }

}
