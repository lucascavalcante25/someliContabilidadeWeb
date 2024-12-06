import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { TreeSelectModule } from 'primeng/treeselect';
import { Motorista } from '../../motorista/motorista.model';
import { VeiculoService } from '../../cliente/cliente.service';
import { MotoristaService } from '../../motorista/motorista.service';
import { CommonModule } from '@angular/common'; 
import { TreeNode } from 'primeng/api';
import { Veiculo } from '../../cliente/cliente-listar/cliente.model';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { VeiculoMotoristaService } from '../../veiculo-motorista/veiculo-motorista.service';
import { VeiculoMotorista } from '../../veiculo-motorista/veiculoMotorista.model';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-consulta-alocacoes',
  standalone: true,
  imports: [ProgressSpinnerModule, InputTextModule, BreadcrumbModule, DividerModule, PrimeNgModule, FormsModule, ReactiveFormsModule, TreeSelectModule, CommonModule,CalendarModule],
  templateUrl: './consulta-alocacoes.component.html',
  styleUrl: './consulta-alocacoes.component.css'
})
export class ConsultaAlocacoesComponent implements OnInit {
  informacoesForm: FormGroup;
  listaDeMotoristas: any[] = [];
  listaDeVeiculos: any[] = [];
  breadcrumbs: any = [{ "label": "Início", "url": "#" }, { "label": "Consulta Alocações", "url": "#/consulta-alocacoes" }];
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
  motoristasTree: TreeNode[] =[];
  veiculosTree: TreeNode[] =[];
  allMotoristas: Motorista[] = [];
  allVeiculos: Veiculo[]=[];
  id: number;
  http: any;
  dadosConfirmados = false;
  veiculosMotoristasFiltrados: VeiculoMotorista[] = []; 
  isLoading = true;


  constructor(
    private router: Router,
    private fb: FormBuilder,
    public route: ActivatedRoute,
    private veiculoMotoristaService: VeiculoMotoristaService,
    private motoristaService: MotoristaService,
    private veiculoService: VeiculoService
  ) {
    this.informacoesForm = this.fb.group({
      motorista: ['', Validators.nullValidator],
      veiculo: ['', Validators.nullValidator],
      dataInicio: ['', Validators.nullValidator],
      dataFim: ['', Validators.nullValidator]
    });
  }


  ngOnInit(): void {
    this.motoristaService.getListaDeMotoristas().subscribe((data: Motorista[]) => {
      this.allMotoristas = data;
      this.updateMotoristasTree();
    });

    this.veiculoService.getListaDeVeiculos().subscribe((data: Veiculo[]) => {
      this.allVeiculos = data;
      this.updateVeiculoTree();
    });
  }

  updateMotoristasTree() {
    this.motoristasTree = this.convertMotoristasToTreeNodes(this.allMotoristas);
  }

  updateVeiculoTree(){
    this.veiculosTree = this.convertVeiculosToTreeNodes(this.allVeiculos);
  }

  convertMotoristasToTreeNodes(motoristas: Motorista[]): TreeNode[] {
    return motoristas.map(motorista => ({
      label: `${motorista.pessoa.nome} - ${motorista.matricula} - ${motorista.pessoa.codigoPessoa}`,
      value: motorista,
    }));
  }

  convertVeiculosToTreeNodes(veiculos: Veiculo[]): TreeNode[] {
    return veiculos.map(veiculo => ({
      label: `${veiculo.placa} - ${veiculo.descricaoMarcaModelo}`, 
      value: veiculo,
    }));
  }
  resetForm(){
    this.informacoesForm.reset();
    this.dadosConfirmados = false;
  }
  
  prosseguir() {
    const formData = this.informacoesForm.value;
    if (this.informacoesForm.valid) {
      this.isLoading = true; // Ativa o spinner
  
      this.motoristaSelecionado = formData.motorista;
      this.veiculoSelecionado = formData.veiculo;
      this.dataInicioSelecionada = formData.dataInicio;
      this.dataFimselecionada = formData.dataFim;
  
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
    
      const inicioVinculacaoFormatado = this.dataInicioSelecionada 
        ? formatarData(this.dataInicioSelecionada) 
        : null;
      const fimVinculacaoFormatado = this.dataFimselecionada 
        ? formatarData(this.dataFimselecionada) 
        : null;
    
      const veiculoMotoristaDados = {
        motoristaDTO: { id: this.motoristaSelecionado ? this.motoristaSelecionado.value.id : null },
        veiculoDTO: { id: this.veiculoSelecionado ? this.veiculoSelecionado.value.id : null },
        inicioVinculacao: inicioVinculacaoFormatado,
        fimVinculacao: fimVinculacaoFormatado,
      };
    
      this.veiculoMotoristaService.postExibirHistoricoVinculosMotoristaVeiculo(veiculoMotoristaDados).subscribe({
        next: (resposta: VeiculoMotorista[]) => {
          this.veiculosMotoristasFiltrados = resposta;
          this.isLoading = false; // Desativa o spinner após o carregamento
        },
        error: (err) => {
          console.error("Erro ao buscar dados:", err);
          this.isLoading = false; // Desativa o spinner em caso de erro
        },
      });
    
      this.dadosConfirmados = true;
    }
  }
  
  
  formatarData(data: any): string {
    if (data === null || data === undefined) {
      return ''; 
    }

   
    if (typeof data === 'string' && data.includes('T')) {
      const partes = data.split('T')[0].split('-'); 
      const ano = partes[0];
      const mes = partes[1];
      const dia = partes[2];

      return `${dia}/${mes}/${ano}`;
    }


    if (data instanceof Date) {
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano}`;
    }

    console.error('Formato de data não suportado:', data);
    return 'Data inválida';
  }
  

}
