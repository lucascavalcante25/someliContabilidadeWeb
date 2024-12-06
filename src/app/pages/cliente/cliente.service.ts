import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment'; // Certifique-se de que o caminho esteja correto
import { Cliente } from './cliente-listar/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private apiUrl = `${environment.apiBaseUrl}/Cliente`;

  constructor(private http: HttpClient, private router: Router) { }

  getListaDeClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/listarClientes`);
  }

  getListaDeClientesSemVinculo(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/listarClientesSemVinculo`);
  }

  consultarClientePlaca(placa: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/consultaClienteCompleta?placa=${placa}`);
  }

  cadastrarCliente(ClienteCompleto: any): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.apiUrl}/salvarCliente`, ClienteCompleto);
  }

  editarCliente(id: any, Cliente: any): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/editarCliente/${id}`, Cliente);
  }

  buscarPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/obterClientePorId/${id}`);
  }

}