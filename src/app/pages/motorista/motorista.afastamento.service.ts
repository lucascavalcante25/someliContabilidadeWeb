import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AfastamentoModel } from './motorista-afastamento.model';
import { DatePipe } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class MotoristaAfastamentoService {

  apiUrl = `${environment.apiBaseUrl}/motorista-afastamento`;

  constructor(private http: HttpClient, private router: Router, private datePipe: DatePipe) { }

  listarPorFiltro(afastamento: any): Observable<AfastamentoModel[]> {
    return this.http.post<AfastamentoModel[]>(`${this.apiUrl}/listarPorFiltro`, afastamento);
  }

  verificarAfastamentoExistente(motoristaId: number, datIniAfastamento: Date, datFimAfastamento: Date): Observable<AfastamentoModel[]> {
    // Formatando as datas no formato esperado pelo backend (yyyy-MM-dd)
    const formattedDatIniAfastamento = this.datePipe.transform(datIniAfastamento, 'yyyy-MM-dd');
    const formattedDatFimAfastamento = this.datePipe.transform(datFimAfastamento, 'yyyy-MM-dd');

    const params = new HttpParams()
      .set('motoristaId', motoristaId.toString())
      .set('datIniAfastamento', formattedDatIniAfastamento)
      .set('datFimAfastamento', formattedDatFimAfastamento);

    // Chamando o endpoint PUT semelhante ao de vínculos
    return this.http.put<AfastamentoModel[]>(`${this.apiUrl}/verificarAfastamento`, {}, { params });
  }


}
