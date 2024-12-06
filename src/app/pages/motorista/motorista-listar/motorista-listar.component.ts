import { Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { PaginatorModule } from 'primeng/paginator';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { Motorista } from '../motorista.model';
import { MotoristaService } from '../motorista.service';
import { Pessoa } from '../pessoa.model';
import { Veiculo } from '../../cliente/cliente-listar/cliente.model';
import { CategoriaCnhDescricao, CategoriaCnhId } from 'src/app/core/enums/categoriaCnhEnum';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';

interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

@Component({
  selector: 'app-motorista-listar',
  standalone: true,
  imports: [ReactiveFormsModule, PrimeNgModule, AccordionModule, DividerModule, BreadcrumbModule, PaginatorModule, HttpClientModule, ProgressSpinnerModule, CommonModule],
  templateUrl: './motorista-listar.component.html',
  styleUrls: ['./motorista-listar.component.css']
})
export class MotoristaListarComponent {
  @ViewChild(PaginatorModule) paginator: PaginatorModule;
  breadcrumbs: any = [{ "label": "Início", "url": "#" }, { "label": "Lista de motoristas", "url": "#/motorista-listar" }];
  stateOptions: any[];
  motoristaStatus: string;
  veiculo: Veiculo[] = [];
  motoristas: Motorista[] = [];
  pessoa: Pessoa[] = [];
  totalElements: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  expandedRows: { [key: string]: boolean } = {};
  motoristasFiltrados: any[] = [];
  pesquisar: string = ''
  isLoading = true;

  tableColumns = [
    'nome', 'identidade', 'codigoPessoa', 'numeroCnh', 'codCategoriaCnh', 'situacaoCnh', 'veiculo',
    'validadeCnh', 'lotacao', 'sublotacao', 'staMotorista', 'acoes'
  ];

  first: number = 0;
  rows: number = 10;

  onPageChange(event: PageEvent) {
    this.first = event.first;
    this.rows = event.rows;
    this.pageIndex = event.page;
    this.pageSize = event.rows;
    this.getMotoristas(this.pageIndex, this.pageSize);
  }

  constructor(private fb: FormBuilder, private messageService: MessageService,
    private router: Router, private motoristaService: MotoristaService) {
  }

  ngOnInit(): void {
    this.getListaDeMotoristas();
  }

  getMotoristas(page: number, size: number): void {
    this.motoristas = this.motoristas.slice(page * size, (page + 1) * size);
  }

  criarNovoMotorista() {
    this.router.navigate(['/motorista-criar-novo']);
  }

  getListaDeMotoristas(): void {
    this.isLoading = true;
    this.motoristaService.getListaDeMotoristas().subscribe(
      (res: Motorista[]) => {
        res.forEach(row => {
          row.situacaoCnh = this.verificarSituacaoCnh(row.validadeCnh);
          row.ativo = row.staMotorista == 1 ? true : false;
          this.isLoading = false;
        });
        this.motoristas = res;
        this.motoristasFiltrados = this.motoristas;
        this.isLoading = false;
        console.log(this.motoristas);
      },
      (error) => {
        this.isLoading = false
        console.error('Erro ao carregar motoristas', error);
      }
    );

  }

  verificarSituacaoCnh(validadeCnh: any) {
    const hoje: any = new Date();
    const validade: any = new Date(validadeCnh);
    const diffEmMs = validade - hoje;
    const diffEmDias = Math.floor(diffEmMs / (1000 * 60 * 60 * 24));
    let situacaoCnh;
    if (diffEmDias < 0) {
      situacaoCnh = "CNH vencida";
    } else if (diffEmDias <= 30) {
      situacaoCnh = "Próxima de vencer";
    } else {
      situacaoCnh = "CNH em dia";
    }
    return situacaoCnh;
  }

  getCategoriaKey(codCategoriaCnh: number): string {
    const categoria = CategoriaCnhId.find(item => item.value === codCategoriaCnh);
    return categoria ? categoria.label : '';
  }

  getCodigoCnhDescricao(codigo: string | number): string {
    const codigoStr = String(codigo);
    const tipoVeiculo = CategoriaCnhDescricao.find(item => item.value === codigoStr);
    return tipoVeiculo ? tipoVeiculo.label : 'Descrição não encontrada';
  }

  filtrarMotoristas() {
    const pesquisa = this.pesquisar.toLowerCase();
    const pesquisaCodCategoriaCnh = pesquisa.split(',').map(p => p.trim());

    this.motoristasFiltrados = this.motoristas.filter(motorista => {
      const nome = this.removerAcentos(motorista.pessoa?.nome?.toLowerCase() || '');
      const identidade = this.removerAcentos(motorista.pessoa?.identidade?.toLowerCase() || '');
      const codigoPessoa = this.removerAcentos(motorista.pessoa?.codigoPessoa?.toString().toLowerCase() || '');
      const cnh = this.removerAcentos(motorista.cnh?.toLowerCase() || '');
      const codCategoriaCnh = this.removerAcentos(motorista.codCategoriaCnh?.toString().toLowerCase() || '');
      const situacaoCnh = this.removerAcentos(motorista.situacaoCnh?.toLowerCase() || '');
      const siglaLotacao = this.removerAcentos(motorista.siglaLotacao?.toLowerCase() || '');
      const siglaSublotacao = this.removerAcentos(motorista.siglaSublotacao?.toLowerCase() || '');
      const statusMotorista = motorista.staMotorista === 1 ? 'ativo' : 'inativo';
      const catCnh = this.getCodigoCnhDescricao(pesquisa);

      if (pesquisa === 'ativo') {
        return statusMotorista === 'ativo';
      } else if (pesquisa === 'inativo') {
        return statusMotorista === 'inativo';
      }

      return nome.includes(pesquisa) ||
        identidade.includes(pesquisa) ||
        codigoPessoa.includes(pesquisa) ||
        cnh.includes(pesquisa) ||
        catCnh.includes(codCategoriaCnh) ||
        situacaoCnh.includes(pesquisa) ||
        siglaLotacao.includes(pesquisa) ||
        siglaSublotacao.includes(pesquisa) ||
        statusMotorista.includes(pesquisa);

    });
  }


  removerAcentos(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  editarMotorista(id: number) {
    this.router.navigate(['/motorista-editar/' + id]);
  }

  formatDate(isoDate: string): string {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  isValidDate(dateString: string): boolean {
    return !isNaN(Date.parse(dateString)) && dateString.includes('-');
  }


}



