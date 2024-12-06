import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { DividerModule } from 'primeng/divider';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { VeiculoMotorista } from '../veiculoMotorista.model';
import { VeiculoMotoristaService } from '../veiculo-motorista.service';
import { VeiculoMotoristaHistorico } from '../veiculoMotoristaHistorico.model';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { Motorista } from '../../motorista/motorista.model';
import { Pessoa } from '../../motorista/pessoa.model';
import { Veiculo } from '../../cliente/cliente-listar/cliente.model';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';


interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}
@Component({
  selector: 'app-veiculo-motorista-listar',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule, BreadcrumbModule, DividerModule, PrimeNgModule, FormsModule, CalendarModule, ButtonModule,ToastModule],
  templateUrl: './veiculo-motorista-listar.component.html',
  styleUrls: ['./veiculo-motorista-listar.component.css']
})
export class VeiculoMotoristaListarComponent implements OnInit {

  breadcrumbs: any[] = [
    { "label": "Início", "url": "#" },
    { "label": "Lista de Alocações", "url": "#/veiculo-motorista-listar" }
  ];

  totalElements: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  expandedRows: { [key: string]: boolean } = {};
  veiculosMotoristasFiltrados: any[] = [];
  pesquisar: string = '';
  motorista: Motorista;
  pessoa: Pessoa;
  veiculo: Veiculo;
  mostrarDialogo: boolean = false;
  dataSelecionada: Date | null = null;
  veiculoMotoristaId: number | null = null;
  getListaveiculoMotorista: VeiculoMotorista[] = []
  id: number;
  veiculoMotoristaEditar: VeiculoMotorista = {};
  veiculosMotoristas: VeiculoMotoristaHistorico[] = [];
  mostrarDialogoHistorico: boolean = false;
  veiculoMotoristaSelecionado: VeiculoMotoristaHistorico | null = null;
  powerOffIcon: string;
  hoje: Date;
  isLoading = true;

  tableColumns = [
    'nomeMotorista', 'sublotacaoMotorista', 'veiculo', 'sublotacaoVeiculo', 'marcaVeiculo', 'modeloVeiculo', 'iniciovinculo',
    'fimVinculacao', 'status', 'staMotorista', 'acoes'
  ];

  first: number = 0;
  rows: number = 10;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private veiculoMotoristaService: VeiculoMotoristaService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.hoje = new Date();
    this.getVeiculosMotoristas();
    this.id = +this.route.snapshot.paramMap.get('id')!;
    if (this.id) {
      this.loadHistoricoVinculos(this.id);
    }
    this.powerOffIcon = 'pi pi-power-off';
  }

  onPageChange(event: PageEvent) {
    this.first = event.first;
    this.rows = event.rows;
    this.pageIndex = event.page;
    this.pageSize = event.rows;
    this.getPageVeiculosMotoristas(this.pageIndex, this.pageSize);
  }

  getPageVeiculosMotoristas(page: number, size: number): void {
    this.getListaveiculoMotorista = this.getListaveiculoMotorista.slice(page * size, (page + 1) * size);
  }

  loadHistoricoVinculos(motoristaId: number): void {
    this.veiculoMotoristaService.exibirHistoricoVinculosMotoristaVeiculo(motoristaId).subscribe(
      (dados: VeiculoMotoristaHistorico[]) => {
        this.veiculosMotoristas = dados;
        this.mostrarDialogoHistorico = true;
      },
      error => {
        console.error('Erro ao carregar o histórico de vínculos', error);
      }
    );
  }

  

  getVeiculosMotoristas(): void {
    this.isLoading = true;
    this.veiculoMotoristaService.getListaDeVeiculosMotoristas().subscribe(
      (res: VeiculoMotorista[]) => {
        console.log(res); // Verifique o formato da data retornada aqui
        this.getListaveiculoMotorista = res.map(veiculoMotorista => {
          return {
            ...veiculoMotorista,
            inicioVinculacao: veiculoMotorista.inicioVinculacao ? new Date(veiculoMotorista.inicioVinculacao) : null,
            fimVinculacao: veiculoMotorista.fimVinculacao ? new Date(veiculoMotorista.fimVinculacao) : null
            
          };
        });
        this.veiculosMotoristasFiltrados = this.getListaveiculoMotorista;
        this.filtrarVeiculosMotoristas();
        this.isLoading = false;
      },
      (erro) => {
        this.isLoading = false;
        console.error('Erro ao obter veículos/motoristas:', erro);
      }
    );
  }

  novaAlocacao() {
    this.router.navigate(['/veiculo-motorista-criar']);
  }

  removerAcentos(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  getStatus(fimVinculacao: string | null | undefined): string {
    if (!fimVinculacao) {
      return 'Vigente';
    }
    const fimVinculacaoDate = new Date(fimVinculacao);
    return fimVinculacaoDate > new Date() ? 'Vigente' : 'Encerrada';
    console.log(fimVinculacaoDate);
  }

  filtrarVeiculosMotoristas() {
    const pesquisa = this.pesquisar.toLowerCase();

    this.veiculosMotoristasFiltrados = this.getListaveiculoMotorista.filter(veiculoMotorista => {
      const nome = this.removerAcentos(veiculoMotorista.motoristaDTO.pessoa?.nome?.toLowerCase() || '');
      const siglaSublotacaoMotorista = this.removerAcentos(veiculoMotorista.codSubLotacaoMotorista?.toLowerCase() || '');
      const codVeiculo = this.removerAcentos(veiculoMotorista.codPlacaVeiculo?.toString().toLowerCase() || '');
      const codSubLotacaoVeiculo = this.removerAcentos(veiculoMotorista.codSubLotacaoVeiculo?.toLowerCase() || '');
      const codMarcaModelo = this.removerAcentos(veiculoMotorista.veiculo?.codMarcaModelo?.toString().toLowerCase() || '');
      const inicioVinculacao = veiculoMotorista.inicioVinculacao?.toString() || '';
      const fimVinculacao = veiculoMotorista.fimVinculacao?.toString() || '';
      return nome.includes(pesquisa) ||
        siglaSublotacaoMotorista.includes(pesquisa) ||
        codVeiculo.includes(pesquisa) ||
        codSubLotacaoVeiculo.includes(pesquisa) ||
        codMarcaModelo.includes(pesquisa) ||
        inicioVinculacao.includes(pesquisa) ||
        fimVinculacao.includes(pesquisa);
    });
  }

  cancelar() {
    this.mostrarDialogo = false;
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
  loadVeiculoMotorista(): void {
    this.veiculoMotoristaService.getVeiculoMotoristaById(this.id).subscribe(
      (data: VeiculoMotorista) => {
        this.veiculoMotoristaEditar = data;
      },
      (error) => {
        console.error('Erro ao carregar o VeiculoMotorista', error);
      }
    );
  }


  chamarModal(veiculoMotoristaId: number) {
    this.veiculoMotoristaId = veiculoMotoristaId;
    this.mostrarDialogo = true;
  }
  chamarModalHistorico(id: number): void {
    this.loadHistoricoVinculos(id);
  }

  
  


  updateVeiculoMotorista(): void {
    // Converta a data de início e fim para o tipo Date
    const inicioVinculacao = new Date(this.veiculoMotoristaEditar.inicioVinculacao); 
    const fimVinculacao = new Date(this.veiculoMotoristaEditar.fimVinculacao); 

    // Verifique se a data de fim é anterior à data de início
    if (fimVinculacao <= inicioVinculacao) {
        // Exiba uma mensagem de erro se a data final for inválida
        this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'A data final não pode ser anterior à data de início.'
        });
        return; // Não prossegue se a validação falhar
    }

    // Se a validação passar, prossegue com a atualização
    this.veiculoMotoristaService.editarVinculoVeiculoMotorista(this.veiculoMotoristaId, this.veiculoMotoristaEditar).subscribe(
      () => {
        this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Vínculo atualizado com sucesso.'
        });
        window.location.reload();
      },
      (error) => {
        console.error('Erro ao atualizar o VeiculoMotorista', error);
        this.messageService.add({
            severity: 'warn',
            summary: 'Alerta',
            detail: 'Selecione uma data maior que a data de inicio de vinculo!'
        });
      }
    );
}



  
}
