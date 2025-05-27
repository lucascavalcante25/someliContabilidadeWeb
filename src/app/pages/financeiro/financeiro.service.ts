import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

    buscarClientesAtivos() {
        return this.http.get<ClienteFinanceiro[]>(`${this.baseUrl}/clientes/ativos`);
    }

    buscarClientesFinanceiros(mes: string, ano: number) {
        return this.http.get<ClienteFinanceiro[]>(`${this.baseUrl}/clientes/financeiro`, {
            params: { mes, ano }
        });
    }

    atualizarPagamentoCliente(clienteId: number, pago: boolean, mes: string, ano: number) {
        return this.http.put(`${this.baseUrl}/pagamentos/status`, pago, {
            params: {
                clienteId: clienteId,
                mes: mes,
                ano: ano
            }
        });

    }
    
    buscarDespesasPorMes(mes: string, ano: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/despesas/financeiro`, {
            params: { mes, ano }
        });
    }

    atualizarStatusDespesa(despesaId: number, paga: boolean): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/despesas/status`, paga, {
            params: { despesaId, paga }
        });
    }
}
