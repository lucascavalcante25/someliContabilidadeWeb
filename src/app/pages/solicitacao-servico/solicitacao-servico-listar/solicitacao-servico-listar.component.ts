import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { DividerModule } from 'primeng/divider';
import { PaginatorModule } from 'primeng/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { SolicitacaoServicoService } from '../solicitacao-servico.service';
import { OrgaoLocalService } from 'src/app/core/service/orgaoLocalService/orgaoLocal.service';
import { SolicitacaoServico } from '../solicitacao-servico.model';
import { tipoManutencaoEnumDescricao } from 'src/app/core/enums/tipoManutencaoEnum';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';
import { SolicitacaoServicoEditarComponent } from '../solicitacao-servico-editar/solicitacao-servico-editar.component';
import { ModalService } from '../solicitacao-servico-editar/modal.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';


interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}
@Component({
  selector: 'app-solicitacao-servico-listar',
  standalone: true,
  imports: [ConfirmDialogModule, SolicitacaoServicoEditarComponent, DialogModule, BreadcrumbModule, CardModule, PrimeNgModule, DividerModule, PaginatorModule, DatePipe, ToastModule, ProgressSpinnerModule, CommonModule],
  templateUrl: './solicitacao-servico-listar.component.html',
  styleUrls: ['./solicitacao-servico-listar.component.css']
})
export class SolicitacaoServicoListarComponent {
  ordens: SolicitacaoServico[] = [];
  ordensFiltrados: any[] = [];
  pesquisar: string = '';
  idModal: number;

  isLoading = true;
  tableColumns = [
    'placa',
    'tipoManutenção',
    'vistoria',
    'lotacao',
    'sublotacao',
    'dataSolicitação',
    'ultimaAtualização',
    'situaçãoSolicitação',
    'ações'
  ];

  constructor(private router: Router,
    private modalService: ModalService,
    private ordemDeServicoService: SolicitacaoServicoService,
    private orgaoLocalService: OrgaoLocalService,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,) { }

  expandedRows: { [key: string]: boolean } = {};
  breadcrumbs: any = [{ "label": "Início", "url": "#" }, { "label": "Solicitações de serviço", "url": "#/solicitacao-servico-listar" }];
  solicitacaoServico: SolicitacaoServico[];

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      if (params['sucesso']) {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Solicitação de serviço cadastrada com sucesso.',
          life: 4000,
        }

        );
        this.router.navigate([], {
          queryParams: { sucesso: null },
          queryParamsHandling: 'merge'
        });
      }

      if (params['vistoria']) {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Vistoria cadastrada com sucesso.',
          life: 4000,
        }

        );
        this.router.navigate([], {
          queryParams: { sucesso: null },
          queryParamsHandling: 'merge'
        });
      }
    });
    this.getOrdens();
  }

  criarOrdemDeServico() {
    this.router.navigate(['/solicitacao-servico-criar'])
  }

  first: number = 0;
  rows: number = 10;
  pageSize: number = 5;
  pageIndex: number = 0;

  onPageChange(event: PageEvent) {
    this.first = event.first;
    this.rows = event.rows;
    this.pageIndex = event.page;
    this.pageSize = event.rows;
    this.getVeiculos(this.pageIndex, this.pageSize);
  }

  getVeiculos(page: number, size: number): void {
    this.solicitacaoServico = this.solicitacaoServico.slice(page * size, (page + 1) * size);
  }

  getOrdens(): void {
    this.isLoading = true;
    this.ordemDeServicoService.getListaDeOrdens().subscribe(
      (data: SolicitacaoServico[]) => {
        this.ordens = data;
        this.ordensFiltrados = [...this.ordens];
        this.isLoading = false
        console.log('Lista de ordens de serviço recebida:', this.ordens);
      },
      (error) => {
        this.isLoading = false
        console.error('Erro ao carregar a lista de ordens de serviço', error);
      }
    );
  }

  getDescricaoTipoManutencao(tipo: string): string {
    const manutencao = tipoManutencaoEnumDescricao.find(item => item.value === tipo);
    return manutencao ? manutencao.label : 'Descrição não encontrada';
  }

  getSituacaoDescricao(staEvento: number): string {
    if (staEvento === 2) {
      return "Encerrada";
    } else {
      return "Vigente";
    }
  }

  filtrarOrdens() {
    const pesquisa = this.pesquisar.toLowerCase();

    this.ordensFiltrados = this.ordens.filter(ordem => {
      const placa = this.removerAcentos(ordem.placa?.toLowerCase() || '');
      const tipoManutencao = this.removerAcentos(this.getDescricaoTipoManutencao(ordem.tipoManutencao)?.toLowerCase() || '');
      const vistoria = this.removerAcentos(ordem.vistoria?.toLowerCase() || '');
      const lotacao = this.removerAcentos(ordem.siglaLotacao?.toLowerCase() || '');
      const sublotacao = this.removerAcentos(ordem.siglaSublotacao?.toLowerCase() || '');
      const dataSolicitacao = this.formatarDataParaFiltro(new Date(ordem.dataSolicitacao));
      const ultimaAtualizacao = this.formatarDataParaFiltro(new Date(ordem.dataUltimaAtualizacao));
      const situacaoSolicitacao = this.getSituacaoDescricao(ordem.staEvento).toLowerCase();

      return placa.includes(pesquisa) ||
        tipoManutencao.includes(pesquisa) ||
        vistoria.includes(pesquisa) ||
        lotacao.includes(pesquisa) ||
        sublotacao.includes(pesquisa) ||
        dataSolicitacao.includes(pesquisa) ||
        ultimaAtualizacao.includes(pesquisa) ||
        situacaoSolicitacao.includes(pesquisa);
    });
  }

  removerAcentos(texto: string) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  formatarDataParaFiltro(data: string | Date) {
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    const dia = dataObj.getDate().toString().padStart(2, '0');
    const mes = (dataObj.getMonth() + 1).toString().padStart(2, '0');
    const ano = dataObj.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  irParaDetalhesVistoria(id: number): void {
    this.router.navigate(['/solicitacao-detalhes-vistoria', id]);
  }

  // Função para definir a descrição de vistoria com base no código de status `staEvento`
  getDescricaoVistoria(staEvento) {
    if (staEvento == 1 || staEvento == 3 || staEvento == 4 || staEvento == 5) {
      return "Solicitação aprovada";
    } else if (staEvento == 0) { // ABERTURA
      return "Pendente";
    } else if (staEvento == 2) { // VISTORIA NAO REALIZADA
      return "Solicitação recusada";
    } else {
      return ""; // Ou outro valor padrão, se necessário
    }
  }

  abrirModal(idModal) {
    this.idModal = idModal;
    this.modalService.abrirModal();
  }

  confirmarExclusao(id: number): void {
    this.confirmationService.confirm({
      message: 'Deseja mesmo excluir essa solicitação?',
      icon: 'pi pi-times-circle', // Ícone vermelho
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger custom-accept-button',
      rejectButtonStyleClass: 'p-button-secondary custom-reject-button',
      accept: () => {
        this.excluirSolicitacao(id);
      },
      reject: () => {
        // Ação opcional para o caso de rejeição, se necessário
      }
    });
  }

  excluirSolicitacao(id: number): void {
    this.ordemDeServicoService.excluirSolicitacao(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Solicitação excluída com sucesso!' });
        this.getOrdens(); // Recarrega a lista após a exclusão
      },
      error: (err) => {
        console.error('Erro ao excluir a solicitação:', err);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir a solicitação' });
      }
    });
  }
}