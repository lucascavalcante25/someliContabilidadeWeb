import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { VeiculoMotorista } from './veiculoMotorista.model';
import { VeiculoMotoristaHistorico } from './veiculoMotoristaHistorico.model';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class VeiculoMotoristaService {

  apiUrl = `${environment.apiBaseUrl}/veiculoMotorista`;

  constructor(private http: HttpClient, private router: Router) { }

  getListaDeVeiculosMotoristas(): Observable<VeiculoMotorista[]> {
    return this.http.get<VeiculoMotorista[]>(`${this.apiUrl}/listarVeiculoMotorista`, );
  }

  getlistarVeiculoMotoristaSemVinculo(): Observable<VeiculoMotorista[]> {
    return this.http.get<VeiculoMotorista[]>(`${this.apiUrl}/listarVeiculoMotoristaSemVinculo`, );
  }

  postCadastrarVeiculoMotorista(veiculoMotorista: any): Observable<VeiculoMotorista> {
    return this.http.post<VeiculoMotorista>(`${this.apiUrl}/salvarVinculoVeiculoMotorista`, veiculoMotorista);
  }

  editarVinculoVeiculoMotorista(id:any,veiculoMotorista: any): Observable<VeiculoMotorista> {
    return this.http.put<VeiculoMotorista>(`${this.apiUrl}/editarDataVeiculoMotorista/${id}`, veiculoMotorista);
  }

  exibirHistoricoVinculosMotoristaVeiculo(id:any): Observable<VeiculoMotoristaHistorico[]> {
    return this.http.get<VeiculoMotoristaHistorico[]>(`${this.apiUrl}/exibirHistoricoVinculosMotoristaVeiculo/${id}`);
  }

  getVeiculoMotoristaById(id: number): Observable<VeiculoMotorista> {
    return this.http.get<VeiculoMotorista>(`${this.apiUrl}/veiculoMotorista/${id}`);
  }

  postExibirHistoricoVinculosMotoristaVeiculo(veiculoMotorista: any): Observable<VeiculoMotorista[]> {
    return this.http.post<VeiculoMotorista[]>(`${this.apiUrl}/listarPorFiltro`, veiculoMotorista);
  }

}