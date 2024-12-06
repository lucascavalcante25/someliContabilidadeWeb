import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root',
})
export class ConsultaManutencoesService {
  apiUrl = `${environment.apiBaseUrl}/api`; // Usando environment para a URL base

  constructor(private http: HttpClient) {}

  // Método para buscar manutenções por código da empresa e mês
  buscarManutencoesVolus(payload: { codigoEmpresa: string; mesPeriodo: string }): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/volus/manutencoes`, payload); // URL completa
  }
}
