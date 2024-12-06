import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Equipamento } from './equipamento.model';
import { Cor } from '../equipamento/cor.model';
import { NotaFiscalEquipamentoDTO } from './nota.model';



@Injectable({
  providedIn: 'root'
})
export class EquipamentoService {
  
  apiUrl = `${environment.apiBaseUrl}/equipamento`;
  
  constructor(private http: HttpClient, private router: Router) { }
  
  getListaDeEquipamentos(): Observable<Equipamento[]> {
    return this.http.get<Equipamento[]>(`${this.apiUrl}/listarEquipamentos`);
  }
  getListaDeCores(): Observable<Cor[]> {
    return this.http.get<Cor[]>(`${this.apiUrl}/listarCores`);
  }

  buscarPorId(id: number): Observable<Equipamento> {
    return this.http.get<Equipamento>(`${this.apiUrl}/listarUnicoEquipamento/${id}`);
  }

  buscarPorIdentificador(id: string): Observable<Equipamento> {
    return this.http.get<Equipamento>(`${this.apiUrl}/buscarPorIdentificador/${id}`);
  }

  cadastrarEquipamento(equipamento: any): Observable<Equipamento> {
    return this.http.post<Equipamento>(`${this.apiUrl}/salvarEquipamento`, equipamento);
  }
  
  editarEquipamento(id: any, equipamento: any): Observable<Equipamento> {
    return this.http.put<Equipamento>(`${this.apiUrl}/editarEquipamento/${id}`, equipamento);
  }

  buscarPorChaveAcesso(chaveAcesso: string): Observable<NotaFiscalEquipamentoDTO> {
    return this.http.get<NotaFiscalEquipamentoDTO>(`${this.apiUrl}/buscarPorNF/${chaveAcesso}`);
  }
  buscarCorPorCodigo(codigoCor: string): Observable<Cor> {
    return this.http.get<Cor>(`${this.apiUrl}/cor/${codigoCor}`);
  }
  
}
