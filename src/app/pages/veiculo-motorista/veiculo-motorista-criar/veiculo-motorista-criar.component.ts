import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { PaginatorModule } from 'primeng/paginator';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { VeiculoMotorista } from '../veiculoMotorista.model';
import { ActivatedRoute, Router } from '@angular/router';
import { VeiculoMotoristaService } from '../veiculo-motorista.service';
import { ReactiveFormsModule } from '@angular/forms';
import { TreeSelectModule } from 'primeng/treeselect';
import { Observable } from 'rxjs';
import { Motorista } from '../../motorista/motorista.model';
import { VeiculoService } from '../../cliente/cliente.service';
import { MotoristaService } from '../../motorista/motorista.service';
import { CommonModule } from '@angular/common';  // Adicione este import
import { TreeNode } from 'primeng/api';
import { Veiculo } from '../../cliente/cliente-listar/cliente.model';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-veiculo-motorista-criar',
  standalone: true,
  imports: [InputTextModule, BreadcrumbModule, DividerModule, PrimeNgModule, FormsModule, ReactiveFormsModule, TreeSelectModule, CommonModule,CalendarModule],
  templateUrl: './veiculo-motorista-criar.component.html',
  styleUrl: './veiculo-motorista-criar.component.css'
})
export class VeiculoMotoristaCriarComponent implements OnInit {
  informacoesForm: FormGroup;
  veiculoMotorista: VeiculoMotorista;
  listaDeMotoristas: any[] = [];
  listaDeVeiculos: any[] = [];
  breadcrumbs: any = [{ "label": "Início", "url": "#" }, { "label": "Alocação veículo e motorista", "url": "#/veiculo-motorista-listar" }, { "label": "Nova alocação", "url": "#/veiculo-motorista-criar" }];
  visible: boolean = false;
  isSaving: boolean = false;
  motorista: Motorista;
  veiculo: Veiculo;
  motoristaSelecionado: any;
  veiculoSelecionado: any;
  dataInicioSelecionada: any;
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
  mostrarDialogo: boolean = false;
  hoje: Date;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public route: ActivatedRoute,
    private veiculoMotoristaService: VeiculoMotoristaService,
    private motoristaService: MotoristaService,
    private veiculoService: VeiculoService,
    private messageService: MessageService
  ) {
    this.informacoesForm = this.fb.group({
      motorista: ['', Validators.required],
      veiculo: ['', Validators.required],
      dataInicio: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.hoje = new Date();
    this.motoristaService.getListarMotoristasSemVinculo().subscribe((data: Motorista[]) => {
      this.allMotoristas = data;
      this.updateMotoristasTree();
    });

    this.veiculoService.getListaDeVeiculosSemVinculo().subscribe((data: Veiculo[]) => {
      this.allVeiculos = data;
      this.updateVeiculoTree();
    });
  }

  novaAlocacao() {
    this.dadosConfirmados = false;
    this.mostrarDialogo = false;
    this.informacoesForm.reset();
  }

  irParaListaDeAlocacoes() {
    this.router.navigate(['/veiculo-motorista-listar']);
  }

  filterMotoristas() {
    const filter = this.filterValue.toLowerCase();
    const filteredMotoristas = this.allMotoristas.filter(motorista =>
      motorista.pessoa.nome.toLowerCase().includes(filter) ||
      motorista.matricula.toLowerCase().includes(filter) ||
      motorista.pessoa.codigoPessoa.toString().toLowerCase().includes(filter)
    );
    this.motoristasTree = this.convertMotoristasToTreeNodes(filteredMotoristas);
  }

  filterVeiculos() {
    const filter = this.filterValueModeloOuPlaca.toLowerCase();
    const filteredVeiculos = this.allVeiculos.filter(veiculo =>
      veiculo.placa.toLowerCase().includes(filter) ||
      veiculo.descricaoMarcaModelo?.toLowerCase().includes(filter) 
    );
    this.veiculosTree = this.convertVeiculosToTreeNodes(filteredVeiculos);
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


  salvarVeiculoMotorista() {
    this.veiculoMotoristaService.postCadastrarVeiculoMotorista(this.veiculoMotorista)
      .subscribe(
        response => {
          console.log('Veículo e motorista cadastrados com sucesso!', response);
        },
        error => {
          console.error('Erro ao cadastrar veículo e motorista', error);
        }
      );
  }


  prosseguir() {
    if (this.informacoesForm.valid) {
      const formData = this.informacoesForm.value;
      console.log('Dados do formulário:', formData);
  

      this.motoristaSelecionado = formData.motorista; 
      this.veiculoSelecionado= formData.veiculo; 
      this.dataInicioSelecionada =formData.dataInicio; 
  
      this.dadosConfirmados = true;


    } else {
      console.log('Formulário inválido');
    }
  }
  salvarVeiculo() {
    let dataISO = ''; 

    if (typeof this.dataInicioSelecionada === 'string') {
        const [dia, mes, ano] = this.dataInicioSelecionada.split('/');
        dataISO = new Date(`${ano}-${mes}-${dia}`).toISOString();
    } else if (this.dataInicioSelecionada instanceof Date) {
        dataISO = this.dataInicioSelecionada.toISOString();
    } else {
        console.error('Formato de data inesperado:', this.dataInicioSelecionada);
        return; 
    }

    const veiculoMotoristaDados = {
    
        motoristaDTO: { id: this.motoristaSelecionado.value.id },
        veiculoDTO: { id: this.veiculoSelecionado.value.id },
        inicioVinculacao: dataISO
      
    };
    console.log(veiculoMotoristaDados.inicioVinculacao);
    this.veiculoMotoristaService.postCadastrarVeiculoMotorista(veiculoMotoristaDados).subscribe({
      next: (resposta: VeiculoMotorista) => {
       
        this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Vinculação criada com sucesso.'
        });
        this.showDialog();
        console.log(resposta);
        this.mostrarDialogo = true;
    },
    error: (err) => {
        this.isSaving = false;

       
        console.error('Erro ao atualizar o VeiculoMotorista', err);
        this.messageService.add({
            severity: 'warn',
            summary: 'Alerta',
            detail: 'Motorista ou Veiculo com vinculo existente no período informado!'
        });
    }
    });
}
  

  showDialog() {
    this.visible = true;
  }


  formatDate(isoDate: string): string {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }


  formatarData(event: Event) {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, ''); // Remove todos os caracteres que não são números

    if (valor.length > 2 && valor.length <= 4) {
        valor = valor.replace(/^(\d{2})(\d+)/, '$1/$2');
    } else if (valor.length > 4) {
        valor = valor.replace(/^(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
    }

    input.value = valor;
}
}
