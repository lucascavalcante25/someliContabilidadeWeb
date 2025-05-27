import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { Despesa } from '../despesa.model';
import { DespesaService } from '../despesa.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-despesas-listar',
  standalone: true,
  templateUrl: './despesas-listar.component.html',
  styleUrls: ['./despesas-listar.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    CardModule,
    DividerModule,
    DialogModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    BreadcrumbModule
  ]
})
export class DespesasListarComponent {

  despesas: Despesa[] = [];
  despesasFiltradas: Despesa[] = [];
  breadcrumbs = [
    { label: 'Início', url: '/index' },
    { label: 'Lista de despesas', url: '/despesas-listar' }
  ];
  isLoading = true;
  pesquisar: string = '';

  modalInativacaoVisivel = false;
  despesaSelecionada!: Despesa; 

  tiposDespesa = [
    { key: 1, label: 'Recorrente' },
    { key: 2, label: 'Pontual' },
    { key: 3, label: 'Pessoal'}
  ];

  constructor(
    private despesaService: DespesaService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarDespesas();
  }

  carregarDespesas(): void {
    this.isLoading = true;
    this.despesaService.listar().subscribe({
      next: (res) => {
        this.despesas = res.filter(d => d.ativa);
        this.despesasFiltradas = [...this.despesas];
        this.isLoading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar despesas'
        });
        this.isLoading = false;
      }
    });
  }

  criarNovaDespesa() {
    this.router.navigate(['/despesas-criar-novo']);
  }

  editarDespesa(id: number | undefined) {
    if (!id) return;
    this.router.navigate(['/despesas-criar-novo', id]);
  }

  confirmarInativacao(despesa: Despesa) {
    this.despesaSelecionada = despesa;
    this.modalInativacaoVisivel = true;
  }

  inativarDespesa() {
    if (!this.despesaSelecionada?.id) return;

    this.despesaService.inativar(this.despesaSelecionada.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Inativada',
          detail: 'Despesa inativada com sucesso.'
        });
        this.modalInativacaoVisivel = false;
        this.carregarDespesas();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao inativar despesa.'
        });
        this.modalInativacaoVisivel = false;
      }
    });
  }

  filtrarDespesas() {
    const termo = this.pesquisar.toLowerCase();
    this.despesasFiltradas = this.despesas.filter(d =>
      d.descricao.toLowerCase().includes(termo)
    );
  }

  getLabelTipo(codigo: number): string {
    const tipo = this.tiposDespesa.find(t => t.key === codigo);
    return tipo ? tipo.label : 'Desconhecido';
  }
}
