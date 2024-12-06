import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Motorista } from './motorista.model';
import { DatePipe } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class MotoristaService {

  apiUrl = `${environment.apiBaseUrl}/motorista`;

  constructor(private http: HttpClient, private router: Router, private datePipe: DatePipe) { }

  getListaDeMotoristas(): Observable<Motorista[]> {
    return this.http.get<Motorista[]>(`${this.apiUrl}/listarMotoristas`);
  }

  getListarMotoristasSemVinculo(): Observable<Motorista[]> {
    return this.http.get<Motorista[]>(`${this.apiUrl}/listarMotoristasSemVinculo`);
  }

  getMotoristaPorCpf(cpf: string): Observable<Motorista> {
    return this.http.get<Motorista>(`${this.apiUrl}/dadosMotorista/${cpf}`);
  }

  getDadosMotoristaParaEdicao(id: number): Observable<Motorista> {
    return this.http.get<Motorista>(`${this.apiUrl}/dadosMotoristaParaEdicao/${id}`);
  }

  buscarPorId(id: number): Observable<Motorista> {
    return this.http.get<Motorista>(`${this.apiUrl}/obterMotoristaPorId/${id}`);
  }

  cadastrarMotorista(motorista: any): Observable<Motorista> {
    return this.http.post<Motorista>(`${this.apiUrl}/cadastrarMotorista`, motorista);
  }

  editarMotorista(id: any, motorista: any): Observable<Motorista> {
    return this.http.put<Motorista>(`${this.apiUrl}/editarMotorista/${id}`, motorista);
  }

  verificarVinculosPorPeriodo(motoristaId: number, datIniAfastamento: Date, datFimAfastamento: Date) {
    // Formatando as datas no formato esperado pelo backend (yyyy-MM-dd)
    const formattedDatIniAfastamento = this.datePipe.transform(datIniAfastamento, 'yyyy-MM-dd');
    const formattedDatFimAfastamento = this.datePipe.transform(datFimAfastamento, 'yyyy-MM-dd');

    const params = new HttpParams()
      .set('motoristaId', motoristaId.toString())
      .set('datIniAfastamento', formattedDatIniAfastamento)
      .set('datFimAfastamento', formattedDatFimAfastamento);

    return this.http.put<any[]>(`${this.apiUrl}/verificarVinculosPorPeriodo`, {}, { params });
  }

}
