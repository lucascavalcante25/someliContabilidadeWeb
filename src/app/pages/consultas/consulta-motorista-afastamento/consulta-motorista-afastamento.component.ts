import { TreeNode } from 'primeng/api';
import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { TreeSelectModule } from 'primeng/treeselect';
import { ActivatedRoute, Router } from '@angular/router';
import { InputMaskModule } from 'primeng/inputmask';
import { DialogModule } from 'primeng/dialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { TipoInatividadeDescricao, TipoInatividadeDescricaoId } from 'src/app/core/enums/codigoTipoInatividadeEnum';
import { Motorista } from '../../motorista/motorista.model';
import { MotoristaService } from '../../motorista/motorista.service';
import { Veiculo } from '../../cliente/cliente-listar/cliente.model';
import { MotoristaAfastamentoService } from '../../motorista/motorista.afastamento.service';
import { AfastamentoModel } from '../../motorista/motorista-afastamento.model';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

@Component({
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ],
  selector: 'app-consulta-motorista-afastamento',
  standalone: true,
  imports: [ProgressSpinnerModule, PrimeNgModule, ReactiveFormsModule, CommonModule, CalendarModule, TreeSelectModule, InputMaskModule, DialogModule, BreadcrumbModule, SelectButtonModule],
  templateUrl: './consulta-motorista-afastamento.component.html',
  styleUrl: './consulta-motorista-afastamento.component.css'
})
export class ConsultaMotoristaAfastamentoComponent implements OnInit {
  totalElements: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;

  informacoesForm: FormGroup;
  listaDeMotoristas: any[] = [];
  listaDeVeiculos: any[] = [];
  breadcrumbs: any = [{ "label": "Início", "url": "#" }, { "label": "Consulta motorista por afastamento", "url": "#/consulta-alocacoes" }];
  visible: boolean = false;
  isSaving: boolean = false;
  motorista: Motorista;
  veiculo: Veiculo;
  motoristaSelecionado: any;
  veiculoSelecionado: any;
  dataInicioSelecionada: any;
  dataFimselecionada: any;
  motoristas: Motorista[] = [];
  filteredMotoristas: Motorista[] = [];
  filterValue: string = '';
  filterValueModeloOuPlaca: string = '';
  value: any;
  motoristasTree: TreeNode[] = [];
  veiculosTree: TreeNode[] = [];
  allMotoristas: Motorista[] = [];
  allVeiculos: Veiculo[] = [];
  afastamentosTree: TreeNode[] = []; // Lista de tipos de afastamento
  id: number;
  http: any;
  dadosConfirmados = false;
  afastamentosFiltrados: AfastamentoModel[] = [];
  isLoading = true;
  first: number = 0;
  rows: number = 10;
  
  constructor(
    private router: Router,
    private fb: FormBuilder,
    public route: ActivatedRoute,
    private motoristaAfastamento: MotoristaAfastamentoService,
    private motoristaService: MotoristaService
  ) {
    this.informacoesForm = this.fb.group({
      motorista: ['', Validators.nullValidator],
      afastamento: ['', Validators.nullValidator],
      inicioAfastamento: ['', Validators.nullValidator],
      fimAfastamento: ['', Validators.nullValidator]
    });
  }

  ngOnInit(): void {
    this.motoristaService.getListaDeMotoristas().subscribe((data: Motorista[]) => {
      this.allMotoristas = data;
      this.updateMotoristasTree();
    });

    this.updateAfastamentosTree(); 
  }

  onPageChange(event: PageEvent) {
    this.first = event.first;
    this.rows = event.rows;
    this.pageIndex = event.page;
    this.pageSize = event.rows;
    this.getPageAfastamentosFiltrados(this.pageIndex, this.pageSize);
  }

  getPageAfastamentosFiltrados(page: number, size: number): void {
    this.afastamentosFiltrados= this.afastamentosFiltrados.slice(page * size, (page + 1) * size);
  }

  buscarCodAfastamentoPorId(afastamentoSelecionado: any): string | null {
    if (!afastamentoSelecionado) {
        console.log("afastamentoSelecionado é nulo ou indefinido");
        return null; 
    }
    const tipo = TipoInatividadeDescricao.find(t => t.value === afastamentoSelecionado.value);
    return tipo ? tipo.value : null; 
}

  updateAfastamentosTree() {
    this.afastamentosTree = TipoInatividadeDescricao.map(afastamento => ({
      label: afastamento.label,
      value: afastamento.value
    }));
  }

  updateMotoristasTree() {
    this.motoristasTree = this.convertMotoristasToTreeNodes(this.allMotoristas);
  }

  convertMotoristasToTreeNodes(motoristas: Motorista[]): TreeNode[] {
    return motoristas.map(motorista => ({
      label: `${motorista.pessoa.nome} - ${motorista.matricula} - ${motorista.pessoa.codigoPessoa}`,
      value: motorista,
    }));
  }

  prosseguir() {
    const formData = this.informacoesForm.value;
    
    if (this.informacoesForm.valid) {
      this.isLoading = true;
        this.motoristaSelecionado = formData.motorista;
        this.dataInicioSelecionada = formData.inicioAfastamento;
        this.dataFimselecionada = formData.fimAfastamento;
        
        const formatarData = (dataSelecionada: any): string => {
          let dataISO = '';
          if (typeof dataSelecionada === 'string') {
            const [dia, mes, ano] = dataSelecionada.split('/');
            if (ano && mes && dia) {
              dataISO = new Date(`${ano}-${mes}-${dia}`).toISOString().slice(0, 19);  // yyyy-MM-ddTHH:mm:ss
            } else {
              console.error('Formato de data inválido:', dataSelecionada);
            }
          } else if (dataSelecionada instanceof Date) {
       
            dataISO = dataSelecionada.toISOString().slice(0, 19);
          } else {
            console.error('Formato de data inesperado:', dataSelecionada);
          }
          return dataISO;
        };

        const inicioFormatado = this.dataInicioSelecionada ? formatarData(this.dataInicioSelecionada) : null;
        const fimFormatado = this.dataFimselecionada ? formatarData(this.dataFimselecionada) : null;

        const afastamentoDados = {
            motorista: { id: this.motoristaSelecionado ? this.motoristaSelecionado.value.id : null },
            codAfastamento: this.buscarCodAfastamentoPorId(formData.afastamento),
            datIniAfastamento: inicioFormatado,
            datFimAfastamento: fimFormatado
        };

        this.motoristaAfastamento.listarPorFiltro(afastamentoDados).subscribe({
            next: (resposta: AfastamentoModel[]) => {
                this.afastamentosFiltrados = resposta;
                this.isLoading = false; 
            },
            error: (err) => {
                console.error("Erro ao buscar dados:", err);
                this.isSaving = false;
                this.isLoading = false; 
            },
        });

        this.dadosConfirmados = true;
    }
}


// Função para resetar o formulário
resetForm() {
    this.informacoesForm.reset();
    this.afastamentosFiltrados = [];
    this.dadosConfirmados = false;
}

buscarDescricaoAfastamento(codAfastamento: any): string {
  // Converte o código para número para garantir a comparação correta
  const cod = Number(codAfastamento);
  const afastamento = TipoInatividadeDescricaoId.find(item => item.value === cod);
  return afastamento ? afastamento.label : 'Desconhecido';
}



}
