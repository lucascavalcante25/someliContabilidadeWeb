import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface ClienteFinanceiro {
    clienteId: number;
    nome: string;
    pagamento: string;
    vencimento: number;
    honorario: number;
    pago: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class FinanceiroService {

    private baseUrl = `${environment.apiBaseUrl}/api/financeiro`;

    constructor(private http: HttpClient) { }

    listarClientesAtivos() {
        return this.http.get<ClienteFinanceiro[]>(`${this.baseUrl}/clientes`);
    }

    salvarPagamentos(pagamentos: any[]) {
        return this.http.post('/api/financeiro/pagamentos', pagamentos);
      }
      

    listarPagamentosPorMesEAno(mes: string, ano: number) {
        return this.http.get<any[]>(`${this.baseUrl}/pagamentos/${mes}/${ano}`);
    }


    listarClientesComPagamentos(mes: string, ano: number) {
        return this.http.get<any[]>(`${this.baseUrl}/clientes-com-pagamento`, {
            params: { mes, ano }
        });
    }



}
