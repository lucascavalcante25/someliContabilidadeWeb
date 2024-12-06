import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { Equipamento } from '../equipamento.model';
import { EquipamentoService } from '../equipamento.service';
import { CommonModule, formatDate } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TreeSelectModule } from 'primeng/treeselect';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { CodigoEstadoConservacaoDescricao } from 'src/app/core/enums/codigoEstadoConservacaoEnum';
import { CodigoTipoCombustivelDescricao } from 'src/app/core/enums/codigoTipoCombustivelEnum';
import { TipoEquipamentosEnumDescricao } from 'src/app/core/enums/tipoEquipamentosEnum';
import { Cor } from '../cor.model';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { forkJoin } from 'rxjs';
import { OrgaoLocalService } from 'src/app/core/service/orgaoLocalService/orgaoLocal.service';
import { OrgaoLocalFilhoDTO } from 'src/app/core/service/orgaoLocalService/orgaoLocalFilhoDTO';
import { OrgaoLocalDTO } from 'src/app/core/service/orgaoLocalService/orgaoLocalDTO.model';
import { MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { CodigoTipoCombustivelEquipamentoDescricao } from 'src/app/core/enums/codigoTipoCombustivelEquipamentoEnum';

@Component({
  selector: 'app-equipamento-criar-novo',
  standalone: true,
  imports: [PrimeNgModule, ReactiveFormsModule, CommonModule, CalendarModule, TreeSelectModule, InputMaskModule, DialogModule, BreadcrumbModule, SelectButtonModule, InputTextareaModule, MessagesModule],
  templateUrl: './equipamento-criar-novo.component.html',
  styleUrl: './equipamento-criar-novo.component.css'
})
export class EquipamentoCriarNovoComponent implements OnInit {
  informacoesForm: FormGroup;
  equipamento: Equipamento;
  orgaosLocais: any[] = [];
  treeData: any[] = [];
  treeDataCombustivelEquipamento: any[] = [];
  treeDataEstadoConservacao: any[] = [];
  treeDataTipoCombustivel: any[] = [];
  subOrgaosLocais: any = [];
  subCores: any = [];
  breadcrumbs: any = [{ "label": "Início", "url": "#" }, { "label": "Lista de equipamentos", "url": "#/equipamento-listar" }, { "label": "Novo Equipamento", "url": "javascript:void(0)" }];
  visible: boolean = false;
  isSaving: boolean = false;
  titulo: string;
  cores: Cor[] = [];
  objetoCor: Cor[] = [];
  mostrarTreeSelect: boolean = true;
  stateOptions = [
    { label: 'Ativo', value: 1 },
    { label: 'Inativo', value: 0 }
  ];
  valorDaNotaFiscal: string = '';
  isIdentificadorExistente: boolean = false;
  value: any;


  @Input()
  id: number;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public route: ActivatedRoute,
    private messageService: MessageService,
    private equipamentoService: EquipamentoService,
    private orgaoLocalService: OrgaoLocalService
  ) {

    this.informacoesForm = this.fb.group({
      tipoEquipamento: ['', Validators.required],
      identificador: [{ value: '', disabled: true }],
      estadoConservacao: ['', Validators.required],
      tipoCombustivel: ['', Validators.required],
      numeroNotaFiscal: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      dataDeCompra: [{ value: '', disabled: true }],
      descricaoEquipamento: [''],
      valorDaNotaFiscal: [{ value: '', disabled: true }],
      cnpj: [{ value: '', disabled: true }],
      anoModelo: [''],
      anoFabricacao: [''],
      cores: [{ value: null, disabled: true }],
      tombo: ['', Validators.required],
      orgaoLotacao: ['', Validators.required],
      orgaoSublotacao: ['', Validators.required],
    });

  }

  ngOnInit(): void {
    this.informacoesForm.get('orgaoLotacao')?.valueChanges.subscribe(value => {
      this.onLotacaoChange(value?.key);
    });

    this.carregarTiposDeCombustivelEquipamento()
    this.carregarOrgaosLocais();
    this.carregarTipoEquipamento();
    this.carregarTipoEstadoConservacao();
    this.carregarTipoCombustivel();
    this.onFormChanges();
    // this.aplicarMascara();

    // Verifica se é uma edição (se o ID existe)
    if (!this.id && this.route.snapshot.params["id"]) {
      this.id = this.route.snapshot.params["id"];
      this.isSaving = false;

      this.breadcrumbs = [
        { "label": "Início", "url": "#" },
        { "label": "Lista de equipamentos", "url": "#/equipamento-listar" },
        { "label": "Editar Equipamento", "url": "javascript:void(0)" }
      ];

      forkJoin({
        equipamento: this.equipamentoService.buscarPorId(this.id),
        orgaosLocais: this.orgaoLocalService.obterOrgaosLocaisAtivos(),
      }).subscribe(
        ({ equipamento, orgaosLocais }) => {
          console.log('Equipamento:', equipamento);
          this.equipamento = equipamento;
          this.informacoesForm.get('tipoEquipamento').setValue(this.buscarTipoEquipamento(equipamento.tipoEquipamento));
          this.informacoesForm.get('tombo').setValue(equipamento.tombo);
          this.informacoesForm.get('identificador').setValue(equipamento.identificador);
          this.informacoesForm.get('estadoConservacao').setValue(this.carregarEstadoConservacaoPorKey(equipamento.estadoConservacao));
          this.informacoesForm.get('tipoCombustivel').setValue(this.buscarTipoCombustivelEquipamentoPorId(equipamento.tipoCombustivel));
          this.informacoesForm.get('numeroNotaFiscal').setValue(equipamento.notaFiscal);
          this.onNotaFiscalChange(equipamento.descricaoEquipamento);
          this.informacoesForm.get('dataDeCompra');
          this.informacoesForm.get('orgaoLotacao').setValue(equipamento.orgaoLotacao);
          this.informacoesForm.get('orgaoSublotacao').setValue(equipamento.orgaoSublotacao);
          this.orgaosLocais = this.formatarDadosParaTreeSelect(orgaosLocais);
        },
        (error: any) => {
          console.error('Erro ao carregar dados do equipamento ou órgãos locais', error);
        }
      );
    } else {
      this.isSaving = true;
    }
  }


  exibirLogErro() {
    if (this.informacoesForm.invalid) {
      Object.keys(this.informacoesForm.controls).forEach(field => {
        const control = this.informacoesForm.get(field);
        if (control?.invalid) {
          console.log(`Campo inválido: ${field}`, control.errors);
        }
      });
    }
  }

  salvarEquipamento() {
    if (this.informacoesForm.invalid) {
      this.informacoesForm.markAllAsTouched();
      this.exibirLogErro();
      return;
    }

    const orgaoLotacaoValue = this.informacoesForm.get('orgaoLotacao')?.value;
    const orgaoSublotacaoValue = this.informacoesForm.get('orgaoSublotacao')?.value;
    const tipoCombustivelValue = this.informacoesForm.get('tipoCombustivel')?.value;
    const tipoEquipamentoValue = this.informacoesForm.get('tipoEquipamento')?.value;
    const tipoCorValue = this.informacoesForm.get('cores')?.value;

    const cor = tipoCorValue && tipoCorValue.id ? {
      id: tipoCorValue.id,
      codigo: tipoCorValue.codigo,
      descricao: tipoCorValue.label
    } : this.informacoesForm.get('cores')?.value;

    const validarCampo = (campo: any) => campo != null ? campo : '';

    const dadosEquipamentos = {
      tipoEquipamento: validarCampo(tipoEquipamentoValue ? tipoEquipamentoValue.key : null),
      identificador: validarCampo(this.informacoesForm.get('identificador')?.value || this.equipamento.identificador),
      estadoConservacao: validarCampo(this.informacoesForm.get('estadoConservacao')?.value.key),
      tipoCombustivel: validarCampo(tipoCombustivelValue ? tipoCombustivelValue.key : null),
      anoFabricacao: validarCampo(this.informacoesForm.get('anoFabricacao')?.value),
      descricaoEquipamento: validarCampo(this.informacoesForm.get('descricaoEquipamento')?.value),
      anoEquipamento: validarCampo(this.informacoesForm.get('anoModelo')?.value),
      cor: cor,
      notaFiscal: validarCampo(this.informacoesForm.get('numeroNotaFiscal')?.value || this.equipamento.notaFiscalEquipamentoDTO.numeroNotaFiscal),
      tombo: validarCampo(this.informacoesForm.get('tombo')?.value || this.equipamento.tombo),
      orgaoLotacao: orgaoLotacaoValue ? orgaoLotacaoValue.key : null,
      orgaoSublotacao: orgaoSublotacaoValue ? orgaoSublotacaoValue.key : null,
    };

    console.log('Valores do formulário:', this.informacoesForm.value);
    console.log('dados do equipamento para envio:', dadosEquipamentos);

    this.equipamentoService.cadastrarEquipamento(dadosEquipamentos).subscribe(response => {
      console.log('Equipamento cadastrado com sucesso:', response);
      this.informacoesForm.reset();


      this.showDialog();
    }, error => {
      console.error('Erro ao cadastrar equipamento:', error);
    });
  }

  editarEquipamento() {
    if (this.informacoesForm.invalid) {
      this.informacoesForm.markAllAsTouched();
      this.exibirLogErro();
      return;
    }

    const orgaoLotacaoValue = this.informacoesForm.get('orgaoLotacao')?.value;
    const orgaoSublotacaoValue = this.informacoesForm.get('orgaoSublotacao')?.value;
    const tipoCombustivelValue = this.informacoesForm.get('tipoCombustivel')?.value;
    const tipoEquipamentoValue = this.informacoesForm.get('tipoEquipamento')?.value;
    const tipoCorValue = this.informacoesForm.get('cores')?.value;

    const cor = tipoCorValue && tipoCorValue.id ? {
      id: tipoCorValue.id,
      codigo: tipoCorValue.codigo,
      descricao: tipoCorValue.label
    } : this.informacoesForm.get('cores')?.value;

    const validarCampo = (campo: any) => campo != null && campo != "" ? campo : null;

    const dadosEquipamentos = {
      tipoEquipamento: validarCampo(tipoEquipamentoValue ? tipoEquipamentoValue.key : null),
      identificador: validarCampo(this.informacoesForm.get('identificador')?.value || this.equipamento.identificador),
      estadoConservacao: validarCampo(this.informacoesForm.get('estadoConservacao')?.value.key),
      tipoCombustivel: validarCampo(tipoCombustivelValue ? tipoCombustivelValue.key : null),
      anoFabricacao: validarCampo(this.informacoesForm.get('anoFabricacao')?.value),
      anoEquipamento: validarCampo(this.informacoesForm.get('anoModelo')?.value),
      descricaoEquipamento: validarCampo(this.informacoesForm.get('descricaoEquipamento')?.value),
      cor: validarCampo(cor),
      notaFiscal: validarCampo(this.informacoesForm.get('numeroNotaFiscal')?.value || this.equipamento.notaFiscalEquipamentoDTO.numeroNotaFiscal),
      tombo: validarCampo(this.informacoesForm.get('tombo')?.value || this.equipamento.tombo),
      orgaoLotacao: validarCampo(orgaoLotacaoValue ? orgaoLotacaoValue.key : null),
      orgaoSublotacao: validarCampo(orgaoSublotacaoValue ? orgaoSublotacaoValue.key : null),
    };

    console.log('Valores do formulário:', this.informacoesForm.value);
    console.log('dados do equipamento para envio:', dadosEquipamentos);

    this.equipamentoService.editarEquipamento(this.id, dadosEquipamentos).subscribe(response => {

      console.log('Equipamento cadastrado com sucesso:', response);
      this.router.navigate(['/equipamento-listar'], { queryParams: { sucesso: 'editado' } });
      this.informacoesForm.reset();
      this.showDialog();
    }, error => {
      console.error('Erro ao cadastrar equipamento:', error);
    });
  }

  formatarDataParaBackend(data: string): string {
    const dataObj = new Date(data);
    return formatDate(dataObj, 'dd/MM/yyyy', 'pt-BR');
  }


  onLotacaoChange(id: any): void {
    this.informacoesForm.get('orgaoSublotacao')?.setValue(null);
    this.subOrgaosLocais = [];
    this.orgaoLocalService.obterSublotacao(id).subscribe({
      next: (data: OrgaoLocalFilhoDTO[]) => {
        this.subOrgaosLocais = this.formatarDadosParaSubLotacaoTreeSelect(data);
        console.log('ola')
      },
      error: error => {
        console.error('Erro ao carregar órgãos locais:', error);
      }
    });
  }

  formatarDadosParaSubLotacaoTreeSelect(data: OrgaoLocalFilhoDTO[]): any[] {
    const map = new Map<number, any>();
    data.forEach(orgao => {
      const node = {
        key: orgao.id,
        label: orgao.sigla + " - " + orgao.descricao,
        data: orgao.id,
        children: []
      };
      map.set(orgao.id, node);

      if (this.id && orgao.id == this.equipamento.orgaoSublotacao)
        this.informacoesForm.get('orgaoSublotacao').setValue(node);


      if (orgao.orgaoLocalPai !== null && map.has(orgao.orgaoLocalPai)) {
        map.get(orgao.orgaoLocalPai).children.push(node);
      }
    });
    return Array.from(map.values()).filter(node => node.key !== null);
  }

  formatarDadosParaCoresTreeSelect(data: Cor[]): any[] {
    const map = new Map<number, any>();
    data.forEach(cor => {
      const node = {
        id: cor.id,
        codigo: cor.codigo,
        label: cor.descricao,
        children: []
      };
      map.set(cor.id, node);

      if (this.id && cor == this.equipamento.cor)
        this.informacoesForm.get('cores').setValue(node);
    });
    return Array.from(map.values()).filter(node => node.key !== null);
  }

  carregarOrgaosLocais() {
    this.orgaoLocalService.obterOrgaosLocaisAtivos().subscribe({
      next: (data: OrgaoLocalDTO[]) => {
        this.orgaosLocais = this.formatarDadosParaTreeSelect(data);
      },
      error: error => {
        console.error('Erro ao carregar órgãos locais:', error);
      }
    });
  }

  carregarCores() {
    this.equipamentoService.getListaDeCores().subscribe({
      next: (data: Cor[]) => {
        this.cores = this.formatarDadosParaCoresTreeSelect(data);
      },
      error: error => {
        console.error('Erro ao carregar cores:', error);
      }
    });
  }

  formatarDadosParaTreeSelect(data: OrgaoLocalDTO[]): any[] {
    const map = new Map<number, any>();
    data.forEach(orgao => {
      const node = {
        key: orgao.id,
        label: orgao.sigla + " - " + orgao.descricao,
        data: orgao.id,
        children: []
      };
      map.set(orgao.id, node);

      if (this.id && orgao.id == this.equipamento.orgaoLotacao) {
        this.informacoesForm.get('orgaoLotacao').setValue(node);
      }

      if (orgao.orgaoLocalPai !== null && map.has(orgao.orgaoLocalPai)) {
        map.get(orgao.orgaoLocalPai).children.push(node);
      }
    });
    return Array.from(map.values()).filter(node => node.key !== null);
  }

  carregarTipoEquipamento() {
    TipoEquipamentosEnumDescricao.find(item => {
      this.treeData.push({
        label: item.label,
        data: item,
        key: item.value
      });
    });
  }

  buscarTipoEquipamento(id: any) {
    let tree;
    TipoEquipamentosEnumDescricao.find(item => {
      if (item.value == id) {
        tree = {
          label: item.label,
          data: item,
          key: item.value
        };
        return tree;
      }
    });
    return tree;
  }

  carregarTipoCombustivel() {
    CodigoTipoCombustivelDescricao.find(item => {
      this.treeDataTipoCombustivel.push({
        label: item.label,
        data: item,
        key: item.value
      });
    });
  }

  carregarTipoEstadoConservacao() {
    CodigoEstadoConservacaoDescricao.find(item => {
      this.treeDataEstadoConservacao.push({
        label: item.label,
        data: item,
        key: item.value
      });
    });
  }

  carregarEstadoConservacaoPorKey(value: any) {
    let estadoConservacao;
    CodigoEstadoConservacaoDescricao.find(item => {
      if (item.value == value)
        estadoConservacao = {
          label: item.label,
          data: item,
          key: item.value
        };

    });
    return estadoConservacao;
  }

  buscarTipoCombustivelEquipamentoPorId(id: any) {
    let tipoCombustivel = null;
    CodigoTipoCombustivelEquipamentoDescricao.find(item => {
      if (item.value == id) {
        tipoCombustivel = {
          label: item.label,
          data: item,
          key: item.value
        };
      }
    });
    return tipoCombustivel;
  }

  showDialog() {
    this.visible = true;
  }

  irParaListaDeEquipamentos() {
    this.router.navigate(['/equipamento-listar']);
  }

  criarNovoEquipamento() {
    this.router.navigate(['/equipamento-criar-novo']);
    this.visible = false;
  }
  formatTombo(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;
    value = value.replace(/[^a-zA-Z0-9]/g, '');
    value = value.toUpperCase();
    inputElement.value = value;
  }

  validateTombo(event: KeyboardEvent): void {
    const pattern = /^[a-zA-Z0-9]$/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  hasError(field: string, error: string): boolean {
    const control = this.informacoesForm.get(field);
    return control?.hasError(error) && (control.dirty || control.touched);
  }

  onNotaFiscalChange(descricaoEquipamento?: string): void {
    const numeroNotaFiscal = this.informacoesForm.get('numeroNotaFiscal')?.value;

    if (this.isNotaFiscalValida(numeroNotaFiscal)) {
      this.equipamentoService.buscarPorChaveAcesso(numeroNotaFiscal).subscribe(
        (dadosNotaFiscal) => {
          console.log(dadosNotaFiscal);
          const dataFormatada = this.formatarData(new Date(dadosNotaFiscal.horaEdataEmissao));
          this.informacoesForm.patchValue({
            dataDeCompra: dataFormatada,
            valorDaNotaFiscal: dadosNotaFiscal.valorDaNotaFiscal,
            cnpj: dadosNotaFiscal.cnpj,
            anoModelo: dadosNotaFiscal.anoModelo,
            descricaoEquipamento: descricaoEquipamento ? descricaoEquipamento : dadosNotaFiscal.descricao,
            anoFabricacao: dadosNotaFiscal.anoFabricacao,
          });

          this.informacoesForm.get('cores')?.enable();
          const codigoCor = dadosNotaFiscal.cor;

          if (codigoCor != null) {
            this.equipamentoService.buscarCorPorCodigo(codigoCor).subscribe(
              (corObjeto) => {
                console.log(corObjeto);
                this.informacoesForm.patchValue({
                  cores: {
                    id: corObjeto.id,
                    codigo: corObjeto.codigo,
                    descricao: corObjeto.descricao
                  }
                });
                this.mostrarTreeSelect = false;
              },
              (erroCor) => {
                console.error('Erro ao buscar a descrição da cor:', erroCor);
              }
            );
          } else {
            if (this.isEquipamentoNovo()) {
              this.carregarCores();
              this.mostrarTreeSelect = true;
            } else {
              this.equipamentoService.buscarPorId(this.id).subscribe(
                (equipamento) => {
                  const corEquipamento = equipamento.cor;
                  if (corEquipamento) {
                    console.log('Cor associada ao equipamento:', corEquipamento);
                    this.informacoesForm.patchValue({
                      cores: {
                        id: corEquipamento.id,
                        codigo: corEquipamento.codigo,
                        descricao: corEquipamento.descricao
                      }
                    });
                    this.mostrarTreeSelect = false; 
                  } else {
                    this.carregarCores();
                    this.mostrarTreeSelect = true;
                  }
                },
                (erroEquipamento) => {
                  console.error('Erro ao buscar o equipamento por ID:', erroEquipamento);
                }
              );
            }
          }
        },
        (error) => {
          console.error('Erro ao buscar os dados da Nota Fiscal:', error);
        }
      );
    }
  }

  isEquipamentoNovo(): boolean {
    return !this.id; 
  }

  isNotaFiscalValida(notaFiscal: string): boolean {
    const notaFiscalPattern = /^[0-9]+$/;
    return notaFiscalPattern.test(notaFiscal) && notaFiscal.length > 5;
  }

  onFormChanges(): void {
    this.informacoesForm.get('tipoEquipamento').valueChanges.subscribe(() => {
      this.generateIdentificador();
    });

    this.informacoesForm.get('tombo').valueChanges.subscribe(() => {
      this.generateIdentificador();
    });
  }

  generateIdentificador(): void {
    const tipoEquipamento = this.informacoesForm.get('tipoEquipamento').value;
    const tombo = this.informacoesForm.get('tombo').value;
    let equipamentoLabel = '';

    // Verifica o tipo de equipamento (string ou objeto)
    if (tipoEquipamento && typeof tipoEquipamento === 'object' && tipoEquipamento.label) {
      equipamentoLabel = tipoEquipamento.label;
    } else if (typeof tipoEquipamento === 'string') {
      equipamentoLabel = tipoEquipamento;
    }

    // Se o tipo de equipamento e o tombo estiverem presentes
    if (equipamentoLabel && tombo && tombo.length === 6) {
      const identificador = equipamentoLabel.substring(0, 3).toUpperCase() + tombo;

      if (this.equipamento && this.equipamento.identificador === identificador) {
        // O identificador não foi alterado, então não precisa validar
        return;
      }

      // Chama o backend para verificar se o identificador já existe
      this.equipamentoService.buscarPorIdentificador(identificador).subscribe(
        value => {
          if (value && value.id) {
            // Se o identificador já existir, mostra um alerta e limpa o campo identificador
            this.messageService.add({
              severity: 'warn',
              summary: 'Alerta',
              detail: 'Identificador já existe.',
              life: 4000
            });
            
            this.informacoesForm.get('identificador').setValue(null);
            this.isIdentificadorExistente = true;
          } else {
            // Caso o identificador não exista, preenche o campo identificador
            this.informacoesForm.get('identificador').setValue(identificador);
            this.isIdentificadorExistente = false;
          }
        },
        error => {
          // Em caso de erro no backend (exemplo: erro 404)
          this.informacoesForm.get('identificador').setValue(identificador);
        }
      );
    }
  }

  resetForm(): void {
    this.informacoesForm.reset();
    this.equipamento = undefined;
    this.isSaving = false;
  }

  formatarData(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  // aplicarMascara() {
  //   const input = document.getElementById('valorDaNotaFiscal');
  //   const im = new Inputmask({
  //     alias: 'decimal',
  //     radixPoint: ',',
  //     groupSeparator: '.',
  //     digits: 2,
  //     prefix: 'R$ ',
  //     rightAlign: false,
  //     autoUnmask: true
  //   });
  //   im.mask(input);
  // }


  onlyNumbers(event: KeyboardEvent) {
    const char = event.key;

    if (
      event.ctrlKey && (char === 'c' || char === 'v' || char === 'a') ||
      /^[0-9]$/.test(char) ||
      event.key === 'Backspace' ||
      event.key === 'Delete'
    ) {
      return;
    }
    event.preventDefault();
  }

  carregarTiposDeCombustivelEquipamento() {
    CodigoTipoCombustivelEquipamentoDescricao.find(item => {
      this.treeDataCombustivelEquipamento.push({
        label: item.label,
        data: item,
        key: item.value
      });
    });
  }

}