import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentoOrdemServicoService {

    private apiUrl = `${environment.apiBaseUrl}/documentos`;

  constructor(private http: HttpClient) { }

  emitirOrdemServico(id: number): Observable<Blob> {
    // Chama o endpoint de geração de PDF e define o tipo de resposta como Blob (para arquivos)
    return this.http.get(`${this.apiUrl}/emitirOrdemServico/${id}`, { responseType: 'blob' });
  }
}
