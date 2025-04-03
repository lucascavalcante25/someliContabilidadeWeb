import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormsModule } from '@angular/forms';

// PrimeNG específicos do financeiro
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { FinanceiroService } from './financeiro.service';

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PrimeNgModule,
    BreadcrumbModule,
    ToastModule,
    CardModule,
    TabViewModule,
    TableModule,
    CheckboxModule
  ],
  templateUrl: './financeiro.component.html',
  styleUrl: './financeiro.component.css',
  providers: [MessageService]
})
export class FinanceiroComponent implements OnInit {
  breadcrumbs: any = [
    { label: 'Início', url: '#' },
    { label: 'Financeiro', url: 'javascript:void(0)' }
  ];
  constructor(private fb: FormBuilder, private messageService: MessageService, private router: Router, private financeiroService: FinanceiroService, private route: ActivatedRoute) { }

  meses = [
    { label: 'Jan', key: 'JAN' },
    { label: 'Fev', key: 'FEV' },
    { label: 'Mar', key: 'MAR' },
    { label: 'Abr', key: 'ABR' },
    { label: 'Mai', key: 'MAI' },
    { label: 'Jun', key: 'JUN' },
    { label: 'Jul', key: 'JUL' },
    { label: 'Ago', key: 'AGO' },
    { label: 'Set', key: 'SET' },
    { label: 'Out', key: 'OUT' },
    { label: 'Nov', key: 'NOV' },
    { label: 'Dez', key: 'DEZ' },
  ];

  mesSelecionado = new Date().getMonth();

  clientesPorMes: any[][] = [];

  // Dashboard
  totalClientes = 0;
  totalRecebido = 0;
  totalPendente = 0;
  percentualAdimplencia = 0;

  ngOnInit(): void {
    this.buscarClientesDoBackend();

  }

  buscarClientesDoBackend() {
    this.financeiroService.listarClientesAtivos().subscribe(clientes => {
      // clona os dados para todos os meses com "pago = false"
      this.clientesPorMes = this.meses.map(() =>
        clientes.map(c => ({ ...c, pago: false }))
      );
      this.atualizarDashboard();
    });
  }

  salvarPagamentos() {
    const anoAtual = new Date().getFullYear();
    const mesSelecionado = this.meses[this.mesSelecionado].key;

    const pagamentos = this.clientesPorMes[this.mesSelecionado].map(cliente => ({
      clienteId: cliente.clienteId,
      mes: mesSelecionado,
      ano: anoAtual,
      pago: cliente.pago
    }));

    this.financeiroService.salvarPagamentos(pagamentos).subscribe({
      next: () => this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Pagamentos salvos!' }),
      error: () => this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar os pagamentos.' })
    });
  }



  atualizarPagamento(cliente: any, indiceMes: number) {
    console.log(`Cliente ${cliente.nome} marcado como ${cliente.pago ? 'pago' : 'não pago'} no mês ${this.meses[indiceMes].key}`);
    this.atualizarDashboard();
  }

  atualizarDashboard() {
    const mesAtual = this.clientesPorMes[this.mesSelecionado];
    this.totalClientes = mesAtual.length;
    this.totalRecebido = mesAtual.filter(c => c.pago).reduce((acc, c) => acc + c.honorario, 0);
    this.totalPendente = mesAtual.filter(c => !c.pago).reduce((acc, c) => acc + c.honorario, 0);
    this.percentualAdimplencia = this.totalClientes > 0 ? Math.round((mesAtual.filter(c => c.pago).length / this.totalClientes) * 100) : 0;
  }
}
