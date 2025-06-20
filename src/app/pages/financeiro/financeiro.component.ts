import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ActivatedRoute, Router } from '@angular/router';
import { FinanceiroService } from './financeiro.service';
import { ChartModule } from 'primeng/chart';

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
    CheckboxModule,
    ChartModule // Adicionado para gráficos
  ],
  templateUrl: './financeiro.component.html',
  styleUrl: './financeiro.component.css',
  providers: [MessageService]
})
export class FinanceiroComponent implements OnInit {
  breadcrumbs: any = [
    { label: 'Início', url: '/index' },
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

  filtroNome: string = '';
  filtroStatus: string = '';

  statusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Pagos', value: 'pago' },
    { label: 'Pendentes', value: 'pendente' }
  ];


  mesSelecionado = new Date().getMonth();

  clientesPorMes: any[][] = [];

  totalClientes = 0;
  totalRecebido = 0;
  totalPendente = 0;
  percentualAdimplencia = 0;

  chartClientesData: any;
  chartClientesOptions: any;
  chartDespesasData: any;
  chartDespesasOptions: any;

  ngOnInit(): void {
    this.initChartOptions();
    this.buscarClientesDoBackend();
    this.buscarDespesasDoBackend();


  }

  initChartOptions() {
    this.chartClientesOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Recebimentos de Clientes' }
      }
    };
    this.chartDespesasOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Controle de Despesas' }
      }
    };
  }

  buscarClientesDoBackend() {
    const anoAtual = new Date().getFullYear();
    this.meses.forEach((mes, i) => {
      this.financeiroService.buscarClientesFinanceiros(mes.key, anoAtual).subscribe(clientes => {
        this.clientesPorMes[i] = clientes;
        if (i === this.mesSelecionado) {
          this.atualizarDashboard();
        }
      });
    });
  }

  filtrarClientes(lista: any[]): any[] {
    return lista.filter(cliente => {
      const nomeCondicao = !this.filtroNome || cliente.nome.toLowerCase().includes(this.filtroNome.toLowerCase());
      const statusCondicao =
        !this.filtroStatus ||
        (this.filtroStatus === 'pago' && cliente.pago) ||
        (this.filtroStatus === 'pendente' && !cliente.pago);
      return nomeCondicao && statusCondicao;
    });
  }



  atualizarPagamento(cliente: any, indiceMes: number) {
    const mes = this.meses[indiceMes].key;
    const ano = new Date().getFullYear();

    this.financeiroService.atualizarPagamentoCliente(cliente.clienteId, cliente.pago, mes, ano).subscribe({
      next: () => this.atualizarDashboard(),
      error: err => {
        console.error('Erro ao salvar pagamento:', err);
        cliente.pago = !cliente.pago;
      }
    });
  }



  atualizarDashboard() {
    const mesAtual = this.clientesPorMes[this.mesSelecionado] || [];
    this.totalClientes = mesAtual.length;
    this.totalRecebido = mesAtual.filter(c => c.pago).reduce((acc, c) => acc + c.honorario, 0);
    this.totalPendente = mesAtual.filter(c => !c.pago).reduce((acc, c) => acc + c.honorario, 0);
    this.percentualAdimplencia = this.totalClientes > 0 ? Math.round((mesAtual.filter(c => c.pago).length / this.totalClientes) * 100) : 0;
    this.atualizarGraficoClientes();
  }

  atualizarGraficoClientes() {
    const mesAtual = this.clientesPorMes[this.mesSelecionado] || [];
    const pagos = mesAtual.filter(c => c.pago).reduce((acc, c) => acc + c.honorario, 0);
    const pendentes = mesAtual.filter(c => !c.pago).reduce((acc, c) => acc + c.honorario, 0);
    this.chartClientesData = {
      labels: ['Recebido', 'Pendente'],
      datasets: [
        {
          data: [pagos, pendentes],
          backgroundColor: ['#22c55e', '#ef4444'],
          hoverBackgroundColor: ['#16a34a', '#b91c1c']
        }
      ]
    };
  }


  despesasPorMes: any[][] = [];
  mesSelecionadoDespesas = new Date().getMonth();
  totalDespesasAtivas = 0;
  totalDespesasPagas = 0;
  totalDespesasPendentes = 0;
  percentualDespesasQuitadas = 0;

  buscarDespesasDoBackend() {
    const anoAtual = new Date().getFullYear();
    this.meses.forEach((mes, i) => {
      this.financeiroService.buscarDespesasPorMes(mes.key, anoAtual).subscribe(despesas => {
        this.despesasPorMes[i] = despesas.map(d => ({
          ...d,
          paga: !!d.paga 
        }));
        console.log(`Despesas para ${mes.label}:`, this.despesasPorMes[i]);

        if (i === this.mesSelecionadoDespesas) {
          this.atualizarDashboardDespesas();
        }
      });
    });
  }

  atualizarStatusDespesa(despesa: any, indiceMes: number) {
    const mes = this.meses[indiceMes].key;
    const ano = new Date().getFullYear();

    this.financeiroService.atualizarStatusDespesa(despesa.id, despesa.paga, mes, ano).subscribe({
      next: () => this.atualizarDashboardDespesas(),
      error: err => {
        console.error('Erro ao atualizar despesa:', err);
        despesa.paga = !despesa.paga; 
      }
    });
  }


  atualizarDashboardDespesas() {
    const mesAtual = this.despesasPorMes[this.mesSelecionadoDespesas] || [];
    this.totalDespesasAtivas = mesAtual.length;
    this.totalDespesasPagas = mesAtual.filter(d => d.paga).reduce((acc, d) => acc + d.valorMensal, 0);
    this.totalDespesasPendentes = mesAtual.filter(d => !d.paga).reduce((acc, d) => acc + d.valorMensal, 0);
    this.percentualDespesasQuitadas = this.totalDespesasAtivas > 0
      ? Math.round((mesAtual.filter(d => d.paga).length / this.totalDespesasAtivas) * 100)
      : 0;
    this.atualizarGraficoDespesas();
  }

  atualizarGraficoDespesas() {
    const mesAtual = this.despesasPorMes[this.mesSelecionadoDespesas] || [];
    const pagas = mesAtual.filter(d => d.paga).reduce((acc, d) => acc + d.valorMensal, 0);
    const pendentes = mesAtual.filter(d => !d.paga).reduce((acc, d) => acc + d.valorMensal, 0);
    this.chartDespesasData = {
      labels: ['Pagas', 'Pendentes'],
      datasets: [
        {
          data: [pagas, pendentes],
          backgroundColor: ['#22c55e', '#ef4444'],
          hoverBackgroundColor: ['#16a34a', '#b91c1c']
        }
      ]
    };
  }

  // Atualizar gráficos ao trocar de aba
  onTabChangeClientes(event: any) {
    this.mesSelecionado = event.index;
    this.atualizarDashboard();
  }
  onTabChangeDespesas(event: any) {
    this.mesSelecionadoDespesas = event.index;
    this.atualizarDashboardDespesas();
  }

}
