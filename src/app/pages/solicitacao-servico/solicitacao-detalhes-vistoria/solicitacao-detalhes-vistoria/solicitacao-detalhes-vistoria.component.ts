import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// import { KeycloakService } from 'keycloak-angular';
// import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { TreeNode } from 'primeng/api';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TreeSelectModule } from 'primeng/treeselect';
import { debounceTime, Subject } from 'rxjs';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { tipoManutencaoEnumDescricao } from 'src/app/core/enums/tipoManutencaoEnum';
import { Motorista } from 'src/app/pages/motorista/motorista.model';
import { PessoaJuridicaDTO } from '../../pessoaFisicaJuridica';
import { SolicitacaoServicoService } from '../../solicitacao-servico.service';
import { VistoriaSolicitacaoDTO } from '../../vistoriaSolicitacaoDTO.model';
import { SolicitacaoServicoCompletaDTO } from '../solicitacao-detalhes-vistoria.model';
import { DocumentoOrdemServicoService } from '../../documento-ordem-servico.service';

@Component({
  selector: 'app-solicitacao-detalhes-vistoria',
  standalone: true,
  providers: [
  ],
  imports: [ProgressSpinnerModule, ReactiveFormsModule, BreadcrumbModule, PrimeNgModule, CommonModule, FormsModule, TreeSelectModule, InputTextareaModule],
  templateUrl: './solicitacao-detalhes-vistoria.component.html',
  styleUrls: ['./solicitacao-detalhes-vistoria.component.css']
})
export class SolicitacaoDetalhesVistoriaComponent implements OnInit {
  formulario: FormGroup;
  breadcrumbs: any = [
    { "label": "Início", "url": "#" },
    { "label": "Solicitação de serviço", "url": "#/solicitacao-servico-listar" },
    { "label": "Detalhes de solicitação de serviço", "url": "javascript:void(0)" }
  ];
  showVistoria = false;
  showVistoriaFeita = false;
  solicitacaoSelecionada: SolicitacaoServicoCompletaDTO = {};
  mostrarCard: boolean = false;
  inspectionCompleted: boolean = false;
  isApproved: any = '';
  justification: string = '';
  cnpj: string = '';
  pessoaJuridica: PessoaJuridicaDTO | null = null;
  errorMessage: string | null = null;
  motoristas: Motorista[];
  motoristaOptions: TreeNode[] = [];
  selectedMotorista: TreeNode | null = null;
  solicitacaoId?: number;
  vistoriaSolicitacaoDTO: VistoriaSolicitacaoDTO[]
  private cnpjSubject: Subject<string> = new Subject<string>();
  vistoriaRealizada: boolean = false;
  vistoriaRecusada: boolean = false;
  razaoSocial: string | null = null;
  isLoading = true;
  approvalOptions: TreeNode[] = [
    { label: 'Sim', data: 'sim', key: '1' },
    { label: 'Não', data: 'nao', key: '0' }
  ];
  dadosVistoria: VistoriaSolicitacaoDTO | null = null;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private solicitacaoServicoService: SolicitacaoServicoService,
    private fb: FormBuilder,
    private documentoOrdemServicoService: DocumentoOrdemServicoService, // Injeção do DocumentosService
  ) {
    this.formulario = this.fb.group({
      aprovaSimOuNao: [null, Validators.required],
      justificativa: ['', Validators.required],
      cnpj: [null, Validators.required],
      razaoSocialOficina: [{ value: '', disabled: true }, Validators.required],
      motorista: [null, Validators.required],
      quilomentragemAtual: ['', Validators.required],
      servicosIncluidos: ['',],
      observacoesVistoria: ['',]
    });
  }

  ngOnInit(): void {
    this.getMotoristasSemVinculo();

    this.cnpjSubject.pipe(
      debounceTime(500)
    ).subscribe((cnpj) => this.consultarPessoaJuridica(cnpj));

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.solicitacaoId = id;
        this.buscarSolicitacaoPorId(id);
        this.buscarDetalhesDaVistoria(id);
      } else {
        console.error('ID da solicitação não encontrado na rota');
      }
    })
    const staAprovacao = Number(this.formulario.get('aprovaSimOuNao')?.value.key);
    if (staAprovacao !== null && staAprovacao !== undefined) {
      this.formulario.get('aprovaSimOuNao')?.disable();
    }

  }

  emitirOrdemServico(): void {
    if (!this.solicitacaoId) {
      console.error('ID da solicitação não encontrado');
      return;
    }

    this.documentoOrdemServicoService.emitirOrdemServico(this.solicitacaoId).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const downloadURL = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = 'OrdemServico.pdf';
        link.click();
      },
      error: (error) => {
        console.error('Erro ao gerar o PDF', error);
      }
    });
  }

  buscarSolicitacaoPorId(id: number): void {
    this.solicitacaoServicoService.buscarPorId(id).subscribe({
      next: (data) => {
        if (data) {
          this.solicitacaoSelecionada = data;
          const cnpj = data.vistoria?.seqPessoaFisicaJuridica;

          if (cnpj) {
            this.consultarPessoaJuridica2(cnpj.toString());
          }

          console.log(data);
        } else {
          console.error('Dados da solicitação não encontrados');
        }
      },
      error: (err) => {
        console.error('Erro ao buscar os detalhes da solicitação:', err);
      }
    });
  }

  consultarPessoaJuridica2(cnpj: string): void {
    this.solicitacaoServicoService.consultarPessoaJuridica(cnpj).subscribe({
      next: (data: any) => {
        this.razaoSocial = data.razaoSocial;
      },
      error: (err) => {
        console.error('Erro ao consultar a pessoa jurídica:', err);
        this.razaoSocial = null;
      }
    });
  }

  buscarDetalhesDaVistoria(id: number): void {
    this.solicitacaoServicoService.buscarPorId(id).subscribe({
      next: (response) => {
        console.log('Resposta da API:', response);
        if (response && response.vistoria) {
          if (response.vistoria.staEvento == 2) {
            this.vistoriaRecusada = true;
            this.vistoriaRealizada = false;
            this.isLoading = true;
          } else {
            this.vistoriaRealizada = true;
            this.vistoriaRecusada = false;
            this.dadosVistoria = response.vistoria;
            this.isLoading = true;
          }
          console.log('Vistoria encontrada:', this.dadosVistoria);
          this.isLoading = false;
        } else {
          this.vistoriaRealizada = false;
          this.vistoriaRecusada = false;
          console.log('Vistoria não encontrada.');
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Erro ao buscar os detalhes da vistoria:', err);
      }
    });
  }

  getSituacaoDescricao(situacao: number): string {
    switch (situacao) {
      case 1: return 'Vigente';
      case 2: return 'Encerrado';
      default: return 'Situação desconhecida';
    }
  }

  getDescricaoTipoManutencao(tipo: string): string {
    const descricao = tipoManutencaoEnumDescricao.find(item => item.value === tipo);
    return descricao ? descricao.label : 'Tipo desconhecido';
  }

  realizarVistoria() {
    this.showVistoria = true;
    this.vistoriaRealizada = false;
  }

  applyCnpjMask(value: string): string {
    let cnpj = value.replace(/\D/g, '');
    if (cnpj.length > 14) {
      cnpj = cnpj.slice(0, 14);
    }
    cnpj = cnpj.replace(/^(\d{2})(\d)/, '$1.$2');
    cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    cnpj = cnpj.replace(/\.(\d{3})(\d)/, '.$1/$2');
    cnpj = cnpj.replace(/(\d{4})(\d)/, '$1-$2');
    this.formulario.get('cnpj')?.setValue(cnpj, { emitEvent: false });

    return cnpj;
  }

  consultarPessoaJuridica(cnpj: string): void {
    if (cnpj) {
      console.log('Consultando CNPJ:', cnpj);
      this.solicitacaoServicoService.consultarPessoaJuridica(cnpj.replace(/\D/g, ''))
        .subscribe({
          next: (data: PessoaJuridicaDTO) => {
            console.log('Dados recebidos:', data);
            this.pessoaJuridica = data;
            this.errorMessage = null;
            this.formulario.get('razaoSocialOficina')?.setValue(data.razaoSocial);
          },
          error: (error) => {
            console.error('Erro ao consultar pessoa jurídica:', error);
            this.errorMessage = 'Erro ao consultar pessoa jurídica. Verifique o CNPJ e tente novamente.';
            this.pessoaJuridica = null;
            this.formulario.get('razaoSocialOficina')?.setValue('');
          }
        });
    } else {
      console.warn('CNPJ inválido fornecido.');
      this.errorMessage = 'Por favor, insira um CNPJ válido.';
      this.formulario.get('razaoSocialOficina')?.setValue('');
    }
  }

  onCnpjInput(cnpj: string): void {
    console.log('Input do CNPJ:', cnpj);
    this.cnpj = cnpj;
    this.cnpjSubject.next(cnpj);
  }

  getMotoristasSemVinculo(): void {
    this.solicitacaoServicoService.listarOrdensSemVeiculo().subscribe({
      next: (data) => {
        this.motoristas = data;
        this.motoristaOptions = this.transformToTreeNode(data);
      },
      error: (error) => this.errorMessage = 'Failed to load motoristas: ' + error,
    });
  }

  private transformToTreeNode(motoristas: Motorista[]): TreeNode[] {
    return motoristas.map(motorista => ({
      label: motorista.pessoa.nome,
      data: motorista.id,
      key: motorista.id.toString(),
      selectable: true
    }));
  }

  teste() {
    window.alert('Olá')
  }

  salvarVistoriaSolicitacao(): void {
    const staAprovacao = Number(this.formulario.get('aprovaSimOuNao')?.value.key);
    const justificativaControl = this.formulario.get('justificativa');
    if (staAprovacao === 0) {
      justificativaControl?.setValidators([Validators.required]);
  } else {
      justificativaControl?.clearValidators();
      justificativaControl?.setValue(''); // Limpa o valor, se necessário
  }
  justificativaControl?.updateValueAndValidity(); // Atualiza validação

  if (staAprovacao === 1) {
      if (this.formulario.invalid) {
          Object.keys(this.formulario.controls).forEach(field => {
              const control = this.formulario.get(field);
              if (control?.invalid) {
                  console.log(`Campo inválido: ${field}`, control.errors);
                  control.markAsTouched();
              }
          });
          this.formulario.markAllAsTouched();
          return;
      }
  } else {
      if (justificativaControl?.invalid) {
          justificativaControl?.markAsTouched();
          console.log('Erro: justificativa obrigatória');
          return;
      }
  }

    const cnpj = this.formulario.get('cnpj')?.value || '';
    const cnpjValidado = cnpj.replace(/\D/g, '');
    const vistoriaPayload: VistoriaSolicitacaoDTO = {
      solicitacaoServico: this.solicitacaoId,
      justificativa: this.formulario.get('justificativa')?.value || '',
      motorista: this.formulario.get('motorista')?.value?.data || null,
      staAprovacao,
      dscObservacaoVistoria: this.formulario.get('observacoesVistoria')?.value || '',
      dscServicoVistoria: this.formulario.get('servicosIncluidos')?.value || '',
      vlrQuilometragem: this.formulario.get('quilomentragemAtual')?.value || 0,
      seqPessoaFisicaJuridica: Number(cnpjValidado),
      staEvento: 1,
      datVistoria: new Date().toISOString(),
    };

    console.log(vistoriaPayload);
    if (staAprovacao === 0) {
      vistoriaPayload.motorista = null;
      vistoriaPayload.dscObservacaoVistoria = '';
      vistoriaPayload.dscServicoVistoria = '';
      vistoriaPayload.vlrQuilometragem = 0;
      vistoriaPayload.staEvento = 2;
    }

    this.solicitacaoServicoService.cadastrarVistoriaSolicitacao(vistoriaPayload).subscribe({
      next: (response) => {
        console.log('Vistoria cadastrada com sucesso:', response);
        this.router.navigate(['/solicitacao-servico-listar'], { queryParams: { vistoria: 'criado' } });
      },
      error: (error) => {
        console.error('Erro ao cadastrar vistoria:', error);
      }
    });
  }

  limparFormulario(): void {
    this.formulario.reset();
    this.isApproved = null;
    this.formulario.get('aprovaSimOuNao')?.setValue(null);
    this.formulario.markAsPristine();
    this.formulario.markAsUntouched();
    this.formulario.get('aprovaSimOuNao')?.enable();
  }



  formatarCNPJ(cnpj: string | number): string {
    if (!cnpj) return '';

    const cnpjString = cnpj.toString().padStart(14, '0'); // Garante que tenha 14 dígitos
    return `${cnpjString.slice(0, 2)}.${cnpjString.slice(2, 5)}.${cnpjString.slice(5, 8)}/${cnpjString.slice(8, 12)}-${cnpjString.slice(12, 14)}`;
  }
}
