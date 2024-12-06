import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { AccordionModule } from 'primeng/accordion';
import { MessageService } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';
import { PaginatorModule } from 'primeng/paginator';
import { TreeSelectModule } from 'primeng/treeselect';
import { forkJoin } from 'rxjs';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { CodigoApropriacaoDescricao } from 'src/app/core/enums/codigoApropriacaoEnum';
import { CodigoEstadoConservacaoDescricao } from 'src/app/core/enums/codigoEstadoConservacaoEnum';
import { CodigoTipoCategoriaDescricao, CodigoTipoCategoriaEnum } from 'src/app/core/enums/codigoTipoCategoriaEnum';
import { CodigoTipoCombustivelDescricao } from 'src/app/core/enums/codigoTipoCombustivelEnum';
import { CodigoPropriedadeDescricao, CodigoTipoPropriedadeEnum } from 'src/app/core/enums/codigoTipoPropriedadeEnum';
import { CodigoTipoVeiculoDescricao } from 'src/app/core/enums/codigoTipoVeiculo';
import { StatusVeiculoDescricao } from 'src/app/core/enums/statusVeiculoEnum';
import { OrgaoLocalService } from 'src/app/core/service/orgaoLocalService/orgaoLocal.service';
import { OrgaoLocalDTO } from '../../../core/service/orgaoLocalService/orgaoLocalDTO.model';
import { OrgaoLocalFilhoDTO } from '../../../core/service/orgaoLocalService/orgaoLocalFilhoDTO';
import { ClienteService } from '../cliente.service';
import { ClientePlaca } from './cliente-placa.model';
import { Cliente } from '../cliente-listar/cliente.model';



@Component({
  selector: 'app-cliente-criar-novo',
  standalone: true,
  imports: [ ReactiveFormsModule, PrimeNgModule, AccordionModule, PaginatorModule, BreadcrumbModule, CommonModule, TreeSelectModule, InputMaskModule],
  providers: [
  ],
  templateUrl: './cliente-criar-novo.component.html',
  styleUrls: ['./cliente-criar-novo.component.css']
})

export class ClienteCriarNovoComponent {
  breadcrumbs: any = [{ "label": "Início", "url": "#" }, { "label": "Lista de veículos", "url": "#/cliente-listar" }, { "label": "Novo veículo", "url": "javascript:void(0)" }];
  veiculoForm: FormGroup;
  cliente?: Cliente; // Mudar tipo para VeiculoPlaca
  errorMessage: string;
  visible: boolean = false;
  visibleEditarPlaca: boolean = false; // Visibilidade do novo modal
  valorCompraFormatted: string;
  orgaosLocais: any[] = [];
  subOrgaosLocais: any = [];
  codigo: any;
  treeDataPropriedade: any[] = [];
  treeDataEstadoConservacao: any[] = [];
  treeDataApropriacao: any[] = [];
  treeDataStatusVeiculo: any[] = [];
  isSaving: boolean = false;
  veiculoData: ClientePlaca;
  placa: any;
  veiculoNotFound: boolean;
  keydown: boolean;
  formattedKilometragem: string = '';
  // valorCodCategoria: ;

  @Input()
  id: number;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private clienteService: ClienteService,
    private orgaoLocalService: OrgaoLocalService,
    private router: Router,
    public route: ActivatedRoute

  ) {
    this.veiculoForm = this.fb.group({
      placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/), Validators.minLength(7), Validators.maxLength(7)]],
      capacidadeTanque: ['', Validators.required],
      consumoCombustivel: ['', [Validators.required]],
      codPropriedade: [{ value: '', disabled: true }], // Campo desativado
      estadoConservacao: ['', Validators.required],
      quilometragemInicial: ['', Validators.required],
      tombo: ['', Validators.required],
      codApropriacao: ['', Validators.required],
      statusVeiculo: ['', Validators.required],
      orgaoLotacao: ['', Validators.required],
      orgaoSublotacao: ['', Validators.required],
      novaPlaca: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/)]],

    });
  }

  ngOnInit(): void {
    this.carregarOrgaosLocais();

    this.veiculoForm.get('orgaoLotacao')?.valueChanges.subscribe(value => {
      this.onLotacaoChange(value?.key);
    });
    this.carregarTiposDePropriedades();
    this.carregarEstadoConservacao();
    this.carregarApropriacao();
    this.carregarStatusVeiculo();

    if (!this.id && this.route.snapshot.params["id"]) {
      this.id = this.route.snapshot.params["id"];
      this.breadcrumbs = [
        { "label": "Início", "url": "#" },
        { "label": "Lista de veículos", "url": "#/cliente-listar" },
        { "label": "Editar veículo", "url": "javascript:void(0)" }
      ];

      forkJoin({
        cliente: this.clienteService.buscarPorId(this.id),
        orgaosLocais: this.orgaoLocalService.obterOrgaosLocaisAtivos()
      }).subscribe(
        ({ cliente, orgaosLocais }) => {
          this.cliente = cliente;
          this.cliente.descricaoMarcaModelo = cliente.marcaModeloDTO.nome;
          this.cliente.potencia = cliente.marcaModeloDTO.potencia;
          this.cliente.cilindrada = cliente.marcaModeloDTO.cilindrada;
          this.cliente.tipoVeiculo = cliente.marcaModeloDTO.tipoVeiculo;
          this.veiculoForm.get('capacidadeTanque').setValue(cliente.capacidadeTanque);
          this.veiculoForm.get('consumoCombustivel').setValue(cliente.consumoCombustivel);
          this.consultarPelaPlaca();
          this.veiculoForm.get('estadoConservacao').setValue(this.carregarEstadoConservacaoPorKey(cliente.estadoConservacao));
          // Configura o label do `codPropriedade` baseado na categoria do veículo
          const propriedade = this.carregarCodigoPropriedadeDescricaoPorKey(cliente.tipoCategoria.toString());
          this.veiculoForm.get('codPropriedade').setValue(propriedade.label);
          this.veiculoForm.get('codPropriedade').disable();
          this.veiculoForm.get('quilometragemInicial').setValue(cliente.quilometragemInicial);
          this.veiculoForm.get('tombo').setValue(cliente.tombo);
          this.veiculoForm.get('orgaoLotacao').setValue(cliente.orgaoLotacao);
          this.veiculoForm.get('orgaoSublotacao').setValue(cliente.orgaoSublotacao);
          this.veiculoForm.get('codApropriacao').setValue(this.carregarTipoApropriacaoPorKey(cliente.codApropriacao));
          this.veiculoForm.get('placa').clearValidators();
          this.veiculoForm.get('placa').updateValueAndValidity();
          this.veiculoForm.get('statusVeiculo').setValue(this.carregarTipoStatusVeiculoPorKey(cliente.statusVeiculo));

          this.orgaosLocais = this.formatarDadosParaTreeSelect(orgaosLocais);

          console.log(cliente);
        },
        (error: any) => console.error('Erro ao carregar dados do veículo ou órgãos locais', error)
      );
    }

  }

  noFiveConsecutiveNumbersValidator() {
    return (control: any) => {
      const value = control.value;
      if (value && /^\d{5}$/.test(value)) {
        return { fiveConsecutiveNumbers: true };
      }
      return null;
    };
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

      if (this.id && orgao.id == this.cliente.orgaoLotacao) {
        this.veiculoForm.get('orgaoLotacao').setValue(node);
      }

      if (orgao.orgaoLocalPai !== null && map.has(orgao.orgaoLocalPai)) {
        map.get(orgao.orgaoLocalPai).children.push(node);
      }
    });
    return Array.from(map.values()).filter(node => node.key !== null);
  }

  onLotacaoChange(id: any): void {
    this.veiculoForm.get('orgaoSublotacao')?.setValue(null);
    this.subOrgaosLocais = [];
    this.orgaoLocalService.obterSublotacao(id).subscribe({
      next: (data: OrgaoLocalFilhoDTO[]) => {
        this.subOrgaosLocais = this.formatarDadosParaSubLotacaoTreeSelect(data);
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

      if (this.id && orgao.id == this.cliente.orgaoSublotacao)
        this.veiculoForm.get('orgaoSublotacao').setValue(node);
      if (orgao.orgaoLocalPai !== null && map.has(orgao.orgaoLocalPai)) {
        map.get(orgao.orgaoLocalPai).children.push(node);
      }
    });
    return Array.from(map.values()).filter(node => node.key !== null);
  }

  buscarCodApropriacaoPorId(id: any) {
    let apropriacao = null;
    CodigoApropriacaoDescricao.find(item => {
      if (item.value == id) {
        apropriacao = {
          label: item.label,
          data: item,
          key: item.value
        };
      }
    });
    return apropriacao;
  }

  consultarPelaPlaca(): void {
    const placaControl = this.veiculoForm.get('placa');
    const placa = placaControl?.value;

    if (placaControl?.valid) {
      this.clienteService.consultarClientePlaca(placa).subscribe(
        data => {
          if (data) {
            console.log('informa:', data);

            // Armazena os dados na variável cliente (sem `codPropriedade`)
            this.cliente = {
              chassi: data.num_chassi_vcl || '',
              renavam: data.cod_renavam_vcl || 0,
              codMarcaModelo: data.cod_marca_modelo_vcl || 0,
              descricaoMarcaModelo: data.desc_marca_modelo || '',
              cor: data.cod_cor_vcl || 0,
              descricaoCor: data.desc_cor || '',
              quantidadePassageiros: data.qtd_passageiros_vcl,
              tipoCategoria: data.cod_categoria_vcl || 0,
              tipoVeiculo: data.cod_tipo_vcl,
              capacidadeTanque: data.capacidadeTanque || 0,
              potencia: data.potencia ? data.potencia : data.num_potencia_vcl ? parseInt(data.num_potencia_vcl) : 0,
              cilindrada: data.num_cilindradas_vcl || 0,
              tipoCombustivel: data.cod_combustivel_vcl,
              anoFabricacao: data.ano_fabricacao_vcl || 0,
              notaFiscal: data.notaFiscal,
              placa: data.placa,
            };


            console.log('Categoria recebida:', data.cod_categoria_vcl);

            const codPropriedade = (data.cod_categoria_vcl.toString() === CodigoTipoCategoriaEnum.OFICIAL)
              ? CodigoTipoPropriedadeEnum.PROPRIO
              : CodigoTipoPropriedadeEnum.TERCEIRO;
            const codPropriedadeLabel = this.getLabelByValue(codPropriedade);

            this.veiculoForm.patchValue({
              codPropriedade: codPropriedadeLabel
            });
            this.veiculoForm.get('codPropriedade')?.disable();

            placaControl?.disable();
          }
        },
        error => {
          console.error('Erro ao buscar veículo:', error);
          this.veiculoNotFound = true;
          placaControl?.setErrors({ 'notFound': true });
        }
      );
    } else {
      if (placaControl?.hasError('minlength') || placaControl?.hasError('maxlength')) {
        console.error('O campo deve conter 7 caracteres.');
      }
    }
  }

  getLabelByValue(value: string): string {
    const propriedade = CodigoPropriedadeDescricao.find(item => item.value === value);
    return propriedade ? propriedade.label : '';
  }


  exibirLogErro() {
    if (this.veiculoForm.invalid) {
      Object.keys(this.veiculoForm.controls).forEach(field => {
        const control = this.veiculoForm.get(field);
        if (control?.invalid) {
          console.log(`Campo inválido: ${field}`, control.errors);
        }
      });
    }
  }
  cleanNumber(value: string): string {
    return String(value).replace(/[^0-9]/g, '');
  }

  salvarVeiculo() {
    if (this.veiculoForm.invalid) {
      this.veiculoForm.markAllAsTouched();
      this.exibirLogErro();
      return;
    }

    this.isSaving = true;

    const cleanedCapacidadeTanque = this.veiculoForm.get('capacidadeTanque')?.value;
    const cleanQuilometragemInicial = this.veiculoForm.get('quilometragemInicial')?.value;
    const orgaoLotacaoValue = this.veiculoForm.get('orgaoLotacao')?.value;
    const orgaoSublotacaoValue = this.veiculoForm.get('orgaoSublotacao')?.value;
    const codApropriacaoValue = this.veiculoForm.get('codApropriacao')?.value;
    const codStatusVeiculoValue = this.veiculoForm.get('statusVeiculo')?.value;


    const descricaoCodCategoria = this.carregarCodigoPropriedadeDescricaoPorKey(this.cliente.tipoCategoria.toString());

    const codPropriedade = Number(descricaoCodCategoria.key);


    let consumo = this.formatarConsumoCombustivel(this.veiculoForm.get('consumoCombustivel')?.value);
    console.log(this.cliente)
    const veiculoCompleto = {
      anoFabricacao: this.veiculoForm.get('anoFabricacao')?.value || this.cliente.anoFabricacao,
      capacidadeTanque: cleanedCapacidadeTanque,
      chassi: this.cliente.chassi,
      consumoCombustivel: consumo,
      potencia: this.cliente.potencia,
      cilindrada: this.cliente.cilindrada,
      quantidadePassageiros: this.cliente.quantidadePassageiros,
      descricaoMarcaModelo: this.cliente.descricaoMarcaModelo,
      cor: this.cliente.cor,
      estadoConservacao: this.veiculoForm.get('estadoConservacao')?.value.key,
      codMarcaModelo: this.cliente.codMarcaModelo,
      orgaoLotacao: orgaoLotacaoValue ? orgaoLotacaoValue.key : null,
      orgaoSublotacao: orgaoSublotacaoValue ? orgaoSublotacaoValue.key : null,
      placa: this.veiculoForm.get('placa')?.value || this.cliente.placa,
      quilometragemInicial: cleanQuilometragemInicial,
      renavam: this.cliente.renavam,

      notaFiscalId: this.cliente.notaFiscal ? this.cliente.notaFiscal.id : null,

      tipoCategoria: this.cliente.tipoCategoria,
      codPropriedade: codPropriedade,

      tipoCombustivel: this.cliente.tipoCombustivel,
      tipoVeiculo: this.cliente.tipoVeiculo,
      tombo: this.veiculoForm.get('tombo')?.value,
      codApropriacao: codApropriacaoValue ? codApropriacaoValue.key : null,
      statusVeiculo: codStatusVeiculoValue ? codStatusVeiculoValue.key : null,
    };

    console.log('Valor final enviado ao backend: ', veiculoCompleto);

    this.clienteService.cadastrarCliente(veiculoCompleto).subscribe(response => {
      this.showDialog();
      this.isSaving = false;
    });
  }


  formatarConsumoCombustivel(valor: string): string {
    if (!valor) {
      return '';
    }
    let valorLimpo = valor.replace(/[^\d.,]/g, '');

    valorLimpo = valorLimpo.replace(',', '.');
    if (valorLimpo.length > 2 && !valorLimpo.includes('.')) {
      valorLimpo = valorLimpo.substring(0, 2) + '.' + valorLimpo.substring(2);
    }

    const partes = valorLimpo.split('.');
    if (partes.length > 2) {
      valorLimpo = partes[0] + '.' + partes[1];
    }

    if (partes[0].length > 3) {
      partes[0] = partes[0].substring(0, 3);
    }
    if (partes[1]?.length > 2) {
      partes[1] = partes[1].substring(0, 2);
    }

    return partes.length > 1 ? partes[0] + '.' + partes[1] : partes[0];
  }


  onConsumoInput(event: any) {
    let valor = event.target.value;
    let valorFormatado = this.formatarConsumoCombustivel(valor);
    this.veiculoForm.get('consumoCombustivel')?.setValue(valorFormatado, { emitEvent: false });
  }


  showDialog() {
    this.visible = true;
  }

  editarVeiculo() {
    if (this.veiculoForm.invalid) {
      this.veiculoForm.markAllAsTouched();
      this.exibirLogErro();
      return;
    }

    const capacidadeTanque = this.cleanNumber(this.veiculoForm.get('capacidadeTanque')?.value);
    const quilometragemInicial = this.cleanNumber(this.veiculoForm.get('quilometragemInicial')?.value);
    let consumo = this.veiculoForm.get('consumoCombustivel')?.value
    const veiculoCompleto = {
      id: this.id,
      anoFabricacao: this.veiculoForm.get('anoFabricacao')?.value || this.cliente.anoFabricacao,
      capacidadeTanque: capacidadeTanque,
      consumoCombustivel: consumo,
      cilindrada: this.cliente.cilindrada,
      quantidadePassageiros: this.cliente.quantidadePassageiros,
      descricaoMarcaModelo: this.cliente.descricaoMarcaModelo,
      cor: this.cliente.cor,
      estadoConservacao: this.veiculoForm.get('estadoConservacao')?.value.key,
      codMarcaModelo: this.cliente.codMarcaModelo,
      orgaoLotacao: this.veiculoForm.get('orgaoLotacao')?.value?.key || null,
      orgaoSublotacao: this.veiculoForm.get('orgaoSublotacao')?.value?.key || null,
      quilometragemInicial: quilometragemInicial,
      renavam: this.cliente.renavam,
      tipoCategoria: this.cliente.tipoCategoria,
      codPropriedade: this.veiculoForm.get('codPropriedade')?.value.key,
      tipoCombustivel: this.cliente.tipoCombustivel,
      tipoVeiculo: this.cliente.marcaModeloDTO.tipoVeiculo,
      tombo: this.veiculoForm.get('tombo')?.value,
      codApropriacao: this.veiculoForm.get('codApropriacao')?.value?.key || null,
      statusVeiculo: this.veiculoForm.get('statusVeiculo')?.value?.key,
    };

    console.log(veiculoCompleto);
    console.log('Valores do formulário:', this.veiculoForm.value);
    console.log('Dados do veículo para envio:', veiculoCompleto);

    this.clienteService.editarCliente(this.id, veiculoCompleto).subscribe(
      response => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Veículo editado com sucesso!',
          life: 4000,
        });
        this.router.navigate(['/cliente-listar']);
        this.veiculoForm.disable();
      },
      error => {
        console.error('Erro ao editar veículo:', error);
        this.veiculoForm.enable();
      }
    );
  }

  limparFormulario(): void {
    this.veiculoForm.reset();
    this.veiculoForm.enable()
    this.cliente = null;
    this.errorMessage = null;
  }

  removerAcentos(texto: string): string {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  onPlacaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let placaValue = input.value.replace(/[^A-Za-z0-9]/g, '');
    placaValue = placaValue.toUpperCase();
    input.value = placaValue;
    if (this.veiculoForm.get('matricula')) {
      this.veiculoForm.get('matricula').setValue(placaValue);
    }
  }

  getCategoriaLabel(value: string): string {
    const codigoStr = String(value);
    const categoria = CodigoTipoCategoriaDescricao.find(item => item.value === codigoStr);
    return categoria ? categoria.label : '';
  }

  getTipoVeiculoDescricao(value: string): string {
    const codigoStr = String(value);
    const tipoVeiculo = CodigoTipoVeiculoDescricao.find(item => item.value === codigoStr);
    return tipoVeiculo ? tipoVeiculo.label : '';
  }

  getTipoCombustivel(value: string): string {
    const codigoStr = String(value);
    const tipoCombustivel = CodigoTipoCombustivelDescricao.find(item => item.value === codigoStr);
    return tipoCombustivel ? tipoCombustivel.label : '';
  }

  carregarTiposDePropriedades() {
    CodigoPropriedadeDescricao.find(item => {
      this.treeDataPropriedade.push({
        label: item.label,
        data: item,
        key: item.value
      });
    });
  }

  carregarEstadoConservacao() {
    CodigoEstadoConservacaoDescricao.find(item => {
      this.treeDataEstadoConservacao.push({
        label: item.label,
        data: item,
        key: item.value
      });
    });
  }

  carregarApropriacao() {
    CodigoApropriacaoDescricao.find(item => {
      this.treeDataApropriacao.push({
        label: item.label,
        data: item,
        key: item.value
      });
    });
  }

  carregarStatusVeiculo() {
    StatusVeiculoDescricao.find(item => {
      this.treeDataStatusVeiculo.push({
        label: item.label,
        data: item,
        key: item.value
      });
    });
  }

  carregarCodigoPropriedadeDescricaoPorKey(categoria: string) {
    if (categoria == CodigoTipoCategoriaEnum.OFICIAL) {
      // Se for OFICIAL, retorna 'Próprio'
      return { label: 'Próprio', key: CodigoTipoPropriedadeEnum.PROPRIO };
    } else {
      // Para qualquer outra categoria, retorna 'Terceiro'
      return { label: 'Terceiro', key: CodigoTipoPropriedadeEnum.TERCEIRO };
    }
  }

  carregarTipoApropriacaoPorKey(value: any) {
    let descApropriacao;
    CodigoApropriacaoDescricao.find(item => {
      if (item.value == value)
        descApropriacao = {
          label: item.label,
          data: item,
          key: item.value
        };
    });
    return descApropriacao;
  }

  carregarTipoStatusVeiculoPorKey(value: any) {
    let descStatusVeiculo;
    StatusVeiculoDescricao.find(item => {
      if (item.value == value)
        descStatusVeiculo = {
          label: item.label,
          data: item,
          key: item.value
        };
    });
    return descStatusVeiculo;
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

  resetForm(): void {
    this.veiculoForm.reset();
    this.veiculoForm.get('placa')?.setValue('');
    this.veiculoForm.get('placa')?.markAsUntouched();
    this.cliente = undefined;
    this.veiculoForm.controls['placa'].enable();
    this.isSaving = false;

  }

  validateNumber(event: KeyboardEvent): void {
    const pattern = /^[0-9]$/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  validateCapacidadeTanque(event: KeyboardEvent): void {
    const pattern = /^[0-9,]$/;
    const inputChar = String.fromCharCode(event.charCode);
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;

    if (!pattern.test(inputChar) || value.length > 4) {
      this.keydown = false;
      event.preventDefault();
    } else {
      console.log("setou true");
      this.keydown = true;
    }
  }

  formatCapacidadeTanque(event: any, ignoreKey: boolean): void {
    if (this.keydown == false && !ignoreKey) {
      return;
    }
    this.keydown = false;
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;
    if (value.endsWith('L')) {
      value = value.slice(0, -1);
    }
    value = value.replace(/[^0-9,]/g, '');
    inputElement.value = value ? `${value}L` : '';
  }



  validateTombo(event: KeyboardEvent): void {
    const pattern = /^[a-zA-Z0-9]$/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  formatTombo(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;
    value = value.replace(/[^a-zA-Z0-9]/g, '');
    value = value.toUpperCase();
    inputElement.value = value;
  }

  handleInput(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;
    value = value.replace('_', '');
    value = value.replace(/(\d{2}),L$/, '$1L');
    inputElement.value = value;
  }

  irParaListaDeVeiculos() {
    this.router.navigate(['/cliente-listar']);
  }

  cadastrarNovoVeiculo() {
    this.veiculoForm.reset();
    this.router.navigate(['/cliente-criar-novo']);
    this.cliente = null;
    this.veiculoForm.enable()
    this.visible = false
  }

  onInputChange(event: any): void {
    let valor = event.target.value;
    let numericValue = valor.replace(/\D/g, '');
    if (numericValue) {
      this.formattedKilometragem = `${numericValue} KM`;
    } else {
      this.formattedKilometragem = '';
    }
    this.veiculoForm.get('quilometragemInicial')?.setValue(numericValue);
  }


  corrigirValorConsumo() {
    let consumo = String(this.veiculoForm.get('consumoCombustivel')?.value).replace(' L', '').trim();

    // Verifica se o valor é numérico e mantém o ponto decimal se já estiver presente
    if (!consumo.includes('.') && consumo.length > 1) {
      consumo = consumo.slice(0, consumo.length - 1) + '.' + consumo.slice(consumo.length - 1);
    }

    // Atualiza o valor no form sem adicionar o sufixo ' L' para evitar confusão
    this.veiculoForm.get('consumoCombustivel')?.setValue(consumo);
  }

  abrirModalEditarPlaca(): void {
    this.visibleEditarPlaca = true;
  }

  fecharModalEditarPlaca(): void {
    this.visibleEditarPlaca = false;
    // this.placaForm.reset();
  }

  salvarNovaPlaca(): void {
    console.log('Placa salva:', this.veiculoForm.get('novaPlaca')?.value);
    this.fecharModalEditarPlaca();
  }

}

