import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { CodigoApropriacaoDescricao } from 'src/app/core/enums/codigoApropriacaoEnum';
import { CodigoEstadoConservacaoDescricao } from 'src/app/core/enums/codigoEstadoConservacaoEnum';
import { CodigoTipoCategoriaDescricao } from 'src/app/core/enums/codigoTipoCategoriaEnum';
import { CodigoTipoCombustivelDescricao } from 'src/app/core/enums/codigoTipoCombustivelEnum';
// import { CodigoTipoClienteDescricao } from 'src/app/core/enums/codigoTipoCliente';
import { TipoSistemaFreioDescricao } from 'src/app/core/enums/tipoSistemaFreioEnum';
import { OrgaoLocalService } from 'src/app/core/service/orgaoLocalService/orgaoLocal.service';
import { OrgaoLocalFilhoDTO } from 'src/app/core/service/orgaoLocalService/orgaoLocalFilhoDTO';
import { OrgaoLocalDTO } from '../../../core/service/orgaoLocalService/orgaoLocalDTO.model';
import { ClienteService } from '../cliente.service';
import { Cliente } from './cliente.model';

interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

@Component({
  selector: 'app-Cliente-listar',
  standalone: true,
  imports: [ReactiveFormsModule, PrimeNgModule, AccordionModule, DividerModule, BreadcrumbModule, PaginatorModule, HttpClientModule, CommonModule, ToastModule, ProgressSpinnerModule],
  templateUrl: './cliente-listar.component.html',
  styleUrls: ['./cliente-listar.component.css']
})
export class ClienteListarComponent {
  @ViewChild(PaginatorModule) paginator: PaginatorModule;
  @Input() TITULO = 'Lista de clientes';
  @Input() veiculoData: Cliente[] = [];
  breadcrumbs: any = [{ "label": "Início", "url": "#" }, { "label": "Lista de clientes", "url": "#/Cliente-listar" }];
  Clientes: Cliente[] = [];
  totalElements: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  expandedRows: { [key: string]: boolean } = {};
  descricaoModeloPorPlaca: { [placa: string]: string } = {};
  ClientesFiltrados: any[] = [];
  pesquisar: string = '';
  isLoading = true;

  orgaosLocais: OrgaoLocalDTO[] = [];
  subOrgaosLocais: OrgaoLocalFilhoDTO[] = [];

  tableColumns = [
    'placa', 'descricaoMarcaModelo',
    'tipoCombustivel', 'anoFabricacao',
    'desc_cor',
    'tipoCombustivel', 'orgaoLotacao',
    'orgaoSublotacao', 'estadoConservacao',
    'acoes'
  ];

  first: number = 0;
  rows: number = 10;

  onPageChange(event: PageEvent) {
    this.first = event.first;
    this.rows = event.rows;
    this.pageIndex = event.page;
    this.pageSize = event.rows;
    this.getClientes(this.pageIndex, this.pageSize);
  }

  constructor(private fb: FormBuilder, private messageService: MessageService, private router: Router, private Clienteservice: ClienteService, private orgaoLocalService: OrgaoLocalService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    // this.getListaDeClientes();
    this.carregarOrgaosLocais().subscribe();
    this.carregarSubOrgaosLocais();
  }

  carregarOrgaosLocais(): Observable<void> {
    return this.orgaoLocalService.listarLotacaoAtiva().pipe(
      tap(data => {
        this.orgaosLocais = data;
      }),
      map(() => undefined)
    );
  }

  carregarSubOrgaosLocais(): void {
    this.orgaoLocalService.listarLotacaoAtiva().subscribe(
      data => {
        this.subOrgaosLocais = data;
      },
      error => {
      }
    );
  }

  getClientes(page: number, size: number): void {
    this.Clientes = this.Clientes.slice(page * size, (page + 1) * size);
  }

  toggleRow(row: Cliente): void {
    if (this.expandedRows[row.id]) {
      delete this.expandedRows[row.id];
    } else {
      this.expandedRows = {};
      this.expandedRows[row.id] = true;
    }
  }

  editCliente(Cliente: Cliente): void {
    console.log('Edit:', Cliente);
  }

  criarNovoCliente() {
    this.router.navigate(['/cliente-criar-novo']);
  }

  // getListaDeClientes(): void {
  //   this.isLoading = true;
  //   this.Clienteservice.getListaDeClientes().subscribe(
  //     (res: Cliente[]) => {
  //       this.Clientes = res.map(Cliente => ({
  //         ...Cliente,
  //         codigoTipoCombustivelDescricao: this.getCodigoTipoCombustivelDescricao(Cliente.tipoCombustivel),
  //       }));
  //       this.ClientesFiltrados = this.Clientes;
  //       console.log('Dados recebidos e mapeados:', this.Clientes);
  //       this.isLoading = false;
  //     },
  //     (error: any) => {
  //       console.error('Erro ao carregar veículos', error);
  //       this.isLoading = false;
  //     }
  //   );
  // }

  getEstadoConservacaoLabel(value: string): string {
    const codigoStr = String(value); 
    const tipoCliente = CodigoEstadoConservacaoDescricao.find(item => item.value === codigoStr);
    return tipoCliente ? tipoCliente.label : '';
  }

  getSistemaDeFreioLabel(value: string): string {
    const codigoStr = String(value); 
    const tipoFreio = TipoSistemaFreioDescricao.find(item => item.value === codigoStr);
    return tipoFreio ? tipoFreio.label : '';
  }

  getTipoCategoriaLabel(value: string): string {
    const codigoStr = String(value);
    const tipoCategoria = CodigoTipoCategoriaDescricao.find(item => item.value === codigoStr);
    return tipoCategoria ? tipoCategoria.label : '';
  }

  // getDescricaoTipoCliente(codigo: string | number): string {
  //   const codigoStr = String(codigo); 
  //   // const tipoCliente = CodigoTipoClienteDescricao.find(item => item.value === codigoStr);
  //   return tipoCliente ? tipoCliente.label : 'Descrição não encontrada';
  // }


  // getTipoClientePorDescricao(codigo: string): any[] {
  //   const codigoStr = String(codigo); 
  //   // const tipoCliente = CodigoTipoClienteDescricao.filter(item => item.label.toLowerCase().includes(codigoStr.toLowerCase())).map(item => item.value);
  //   return tipoCliente;
  // }

  getDescricaoEstadoConservacao(codigo: string): any[] {
    const codigoStr = this.removerAcentos(String(codigo));
    const tipoEstadoConservacao = CodigoEstadoConservacaoDescricao.filter(item => this.removerAcentos(item.label).toLowerCase().includes(codigoStr.toLowerCase())).map(item => item.value);
    return tipoEstadoConservacao;
  }

  getCodigoTipoCombustivelDescricao(cod: string | number | null | undefined): string {
    if (cod === null || cod === undefined) {
      return 'Desconhecido';
    }

    const descricao = CodigoTipoCombustivelDescricao.find(item => item.value === cod.toString());
    return descricao ? descricao.label : 'Desconhecido';
  }

  getCodigoTipoCombustivelPorDescricao(codigo: string): any[] {
    const codigoStr = this.removerAcentos(String(codigo));
    const campos = CodigoTipoCombustivelDescricao.filter(item => this.removerAcentos(item.label).toLowerCase().includes(codigoStr.toLowerCase())).map(item => item.value);
    return campos;
  }

  getDescricaoApropriacao(codigo: string | number): string {
    const codigoStr = String(codigo); 
    const tipoCliente = CodigoApropriacaoDescricao.find(item => item.value === codigoStr);
    return tipoCliente ? tipoCliente.label : 'Descrição não encontrada';
  }

  getDescricaoApropriacaoPorDescricao(codigo: string): any[] {
    const codigoStr = String(codigo);
    const descApropriacao = CodigoApropriacaoDescricao.filter(item => item.label.toLowerCase().includes(codigoStr.toLowerCase())).map(item => item.value);
    return descApropriacao;
  }

  formatDate(isoDate: string): string {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  filtrarClientes() {

    const pesquisa = this.pesquisar.toLowerCase();
    this.ClientesFiltrados = this.Clientes.filter(Cliente => {

      const quantidadePassageiros = Cliente.quantidadePassageiros !== undefined ? Cliente.quantidadePassageiros.toString().toLowerCase() : '';
      const quantidadePassageirosComLugares = `${quantidadePassageiros} lugares`;

      const placa = this.removerAcentos(Cliente.placa?.toLowerCase() || '');
      const descricaoMarcaModelo = this.removerAcentos(Cliente.descricaoMarcaModelo?.toLowerCase() || '');
      // const tipoCliente = this.removerAcentos(Cliente.tipoCliente !== undefined ? Cliente.tipoCliente?.toString().toLowerCase() : '');
      const codigoTipoCombustivelDescricao = this.removerAcentos(Cliente.tipoCombustivel?.toString().toLowerCase() || '');
      const anoFabricacao = this.removerAcentos(Cliente.anoFabricacao !== undefined ? Cliente.anoFabricacao.toString().toLowerCase() : '');
      const descricaoCor = this.removerAcentos(Cliente.descricaoCor?.toLowerCase() || '');
      const estadoConservacao = this.removerAcentos(Cliente.estadoConservacao !== undefined ? Cliente.estadoConservacao.toString().toLowerCase() : '');
      const orgaoLotacao = this.removerAcentos(Cliente.siglaLotacao !== undefined ? Cliente.siglaLotacao.toString().toLowerCase() : '');
      const orgaoSublotacao = this.removerAcentos(Cliente.siglaSublotacao !== undefined ? Cliente.siglaSublotacao.toString().toLowerCase() : '');
      const estadoConservacaoTipo = this.getDescricaoEstadoConservacao(pesquisa)
      // const listaTipos = this.getTipoClientePorDescricao(pesquisa);
      const listCombustivel = this.getCodigoTipoCombustivelPorDescricao(pesquisa);
      const apropriacao = this.getDescricaoApropriacaoPorDescricao(pesquisa);

      return placa.includes(pesquisa) ||
        descricaoMarcaModelo.includes(pesquisa) ||
        // listaTipos.includes(tipoCliente) ||
        listCombustivel.includes(codigoTipoCombustivelDescricao) ||
        anoFabricacao.includes(pesquisa) ||
        descricaoCor.includes(pesquisa) ||
        quantidadePassageirosComLugares.includes(pesquisa) ||
        estadoConservacao.includes(pesquisa) ||
        orgaoLotacao.includes(pesquisa) ||
        orgaoSublotacao.includes(pesquisa) ||
        estadoConservacaoTipo.includes(estadoConservacao) ||
        apropriacao.includes(CodigoApropriacaoDescricao);
    });
  }

  removerAcentos(texto: string): string {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  editarCliente(id: number) {
    this.router.navigate(['/Cliente-editar/' + id]);
  }
}