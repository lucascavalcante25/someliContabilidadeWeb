import { HttpClientModule } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { PaginatorModule } from 'primeng/paginator';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { Equipamento } from '../equipamento.model';
import { EquipamentoService } from '../equipamento.service';
import { CodigoTipoCombustivelDescricao } from 'src/app/core/enums/codigoTipoCombustivelEnum';
import { CodigoEstadoConservacaoDescricao } from 'src/app/core/enums/codigoEstadoConservacaoEnum';
import { CommonModule } from '@angular/common';
import { TipoEquipamentosEnumDescricao } from 'src/app/core/enums/tipoEquipamentosEnum';
import { ToastModule } from 'primeng/toast';
import { CodigoTipoCombustivelEquipamentoDescricao } from 'src/app/core/enums/codigoTipoCombustivelEquipamentoEnum';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

@Component({
  selector: 'app-equipamento-listar',
  standalone: true,
  imports: [ProgressSpinnerModule, ReactiveFormsModule, PrimeNgModule, AccordionModule, DividerModule, BreadcrumbModule, PaginatorModule, HttpClientModule, CommonModule, ToastModule],
  templateUrl: './equipamento-listar.component.html',
  styleUrls: ['./equipamento-listar.component.css']
})
export class EquipamentoListarComponent {
  @ViewChild(PaginatorModule) paginator: PaginatorModule;
  breadcrumbs: any = [{ "label": "Início", "url": "#" }, { "label": "Lista de equipamentos", "url": "#/equipamento-listar" }];
  stateOptions: any[];
  equipamentoStatus: string;
  equipamento: Equipamento[] = [];
  totalElements: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  equipamentosFiltrados: any[] = [];
  expandedRows: { [key: string]: boolean } = {};
  isLoading = true;


  pesquisar: string = ''

  tableColumns = [
    'tipoEquipamento', 'identificador', 'anoModelo', 'tipoCombustivel', 'descricaoCor', 'siglaLotacao',
    'siglaSubLotacao', 'estadoConservacao'
  ];

  first: number = 0;
  rows: number = 10;

  onPageChange(event: PageEvent) {
    this.first = event.first;
    this.rows = event.rows;
    this.pageIndex = event.page;
    this.pageSize = event.rows;
    this.getEquipamentos(this.pageIndex, this.pageSize);
  }

  constructor(private fb: FormBuilder, private messageService: MessageService,
    private router: Router, private equipamentoService: EquipamentoService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['sucesso'] === 'editado') {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Equipamento editado com sucesso!',
          life: 4000  
        });
        this.router.navigate([], {
          queryParams: {
            sucesso: null
          },
          queryParamsHandling: 'merge' 
        });
      }
    });
    this.getListaDeEquipamentos();

  }

  filtrarEquipamentos() {
    const pesquisa = this.pesquisar.toLowerCase();
    this.equipamentosFiltrados = this.equipamento.filter(equipamento => {

        const tipoEquipamentoDescricao = this.removerAcentos(this.getDescricaoTipoEquipamento(equipamento.tipoEquipamento)?.toLowerCase() || '');
        const identificador = this.removerAcentos(equipamento.identificador?.toLowerCase() || '');
        
        // Verificação de null ou undefined para anoFabricacao
        const anoFabricacao = equipamento.anoFabricacao != null ? equipamento.anoFabricacao.toString().toLowerCase() : '';
        
        const tipoCombustivelDescricao = this.removerAcentos(this.getCodigoTipoCombustivelEquipamentoPorDescricao(equipamento.tipoCombustivel)?.toLowerCase() || '');
        const descricaoCor =  equipamento.cor ? this.removerAcentos(equipamento.cor.descricao?.toLowerCase() || '') : '';
        const siglaLotacao = this.removerAcentos(equipamento.siglaLotacao?.toLowerCase() || '');
        const siglaSubLotacao = this.removerAcentos(equipamento.siglaSubLotacao?.toLowerCase() || '');
        const estadoConservacaoDescricao = this.removerAcentos(this.getEstadoDeConservacaoDescricao(equipamento.estadoConservacao)?.toLowerCase() || '');

        const estadoConservacaoTipo = this.getDescricaoEstadoConservacao(pesquisa);
        const listaTiposEquipamento = this.getTipoEquipamentoPorDescricao(pesquisa);
        const listCombustivelEquipamento = this.getCodigoTipoCombustivelEquipamentoPorDescricao(pesquisa);

        return tipoEquipamentoDescricao.includes(pesquisa) ||
               identificador.includes(pesquisa) ||
               anoFabricacao.includes(pesquisa) ||  // Verifica se inclui o valor da pesquisa no ano de fabricação
               tipoCombustivelDescricao.includes(pesquisa) ||
               descricaoCor.includes(pesquisa) ||
               siglaLotacao.includes(pesquisa) ||
               siglaSubLotacao.includes(pesquisa) ||
               estadoConservacaoDescricao.includes(pesquisa) ||
               listaTiposEquipamento.includes(tipoEquipamentoDescricao) ||
               listCombustivelEquipamento.includes(tipoCombustivelDescricao) ||
               estadoConservacaoTipo.includes(estadoConservacaoDescricao);
    });
}



  getEquipamentos(page: number, size: number): void {
    this.equipamento = this.equipamento.slice(page * size, (page + 1) * size);
  }

  criarNovoEquipamento() {
    this.router.navigate(['/equipamento-criar-novo']);
  }

  getDescricaoEstadoConservacao(codigo: string): any[] {
    const codigoStr = this.removerAcentos(String(codigo));
    const tipoEstadoConservacao = CodigoEstadoConservacaoDescricao.filter(item => this.removerAcentos(item.label).toLowerCase().includes(codigoStr.toLowerCase())).map(item => item.value);
    return tipoEstadoConservacao;
  }

  getTipoEquipamentoPorDescricao(codigo: string): any[] {
    const codigoStr = this.removerAcentos(String(codigo));
    const tipoEstadoConservacao = TipoEquipamentosEnumDescricao.filter(item => this.removerAcentos(item.label).toLowerCase().includes(codigoStr.toLowerCase())).map(item => item.value);
    return tipoEstadoConservacao;
  }

  getListaDeEquipamentos(): void {
    this.isLoading = true;
    this.equipamentoService.getListaDeEquipamentos().subscribe(
      (res: Equipamento[]) => {
        res.forEach(row => {
          console.log('chegou', row)
        });
        this.equipamento = res;
        this.filtrarEquipamentos()
        this.isLoading = false;
        console.log(this.equipamento);
      },
      
      (error) => {
        this.isLoading = false
        console.error('Erro ao carregar equipamento', error);
      }
      
    );

  }

  removerAcentos(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  editarEquipamento(id: number) {
    this.router.navigate(['/equipamento-editar/' + id]);
  }

  formatDate(isoDate: string): string {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getDescricaoTipoEquipamento(codigo: string | number): string {
    const codigoStr = String(codigo);
    const tipoEquipamento = TipoEquipamentosEnumDescricao.find(item => item.value === codigoStr);
    return tipoEquipamento ? tipoEquipamento.label : 'Descrição não encontrada';
  }

  getCodigoTipoCombustivelEquipamentoPorDescricao(codigo: string | number): string {
    const codigoStr = String(codigo);
    const tipoEquipamento = CodigoTipoCombustivelEquipamentoDescricao.find(item => item.value === codigoStr);
    return tipoEquipamento ? tipoEquipamento.label : 'Descrição não encontrada';
  }

  getEstadoDeConservacaoDescricao(codigo: string | number): string {
    const codigoStr = String(codigo);
    const tipoEquipamento = CodigoEstadoConservacaoDescricao.find(item => item.value === codigoStr);
    return tipoEquipamento ? tipoEquipamento.label : 'Descrição não encontrada';
  }

}





