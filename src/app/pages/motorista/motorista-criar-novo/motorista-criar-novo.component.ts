import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, LOCALE_ID, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TreeSelectModule } from 'primeng/treeselect';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { CategoriaCnhDescricao } from 'src/app/core/enums/categoriaCnhEnum';
import { TipoInatividade, TipoInatividadeDescricao, TipoInatividadeDescricaoId } from 'src/app/core/enums/codigoTipoInatividadeEnum';
import { OrgaoLocalService } from 'src/app/core/service/orgaoLocalService/orgaoLocal.service';
import { OrgaoLocalDTO } from 'src/app/core/service/orgaoLocalService/orgaoLocalDTO.model';
import { OrgaoLocalFilhoDTO } from 'src/app/core/service/orgaoLocalService/orgaoLocalFilhoDTO';
import { MotoristaAfastamentoService } from '../motorista.afastamento.service';
import { Motorista } from '../motorista.model';
import { MotoristaService } from '../motorista.service';
import { Pessoa } from '../pessoa.model';
import { AfastamentoModel } from '../motorista-afastamento.model';

@Component({
  providers: [
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ],
  selector: 'app-motorista-criar-novo',
  standalone: true,
  imports: [PrimeNgModule, ReactiveFormsModule, CommonModule, CalendarModule, TreeSelectModule, InputMaskModule, DialogModule, BreadcrumbModule, SelectButtonModule],
  templateUrl: './motorista-criar-novo.component.html',
  styleUrl: './motorista-criar-novo.component.css'
})
export class MotoristaCriarNovoComponent implements OnInit {
  //matriculaForm: FormGroup;
  informacoesForm: FormGroup;

  motorista: Motorista;
  pessoa?: Pessoa;
  CpfNotFound = false;
  orgaosLocais: any[] = [];
  treeData: any[] = [];
  subOrgaosLocais: any = [];
  breadcrumbs: any = [{ "label": "Início", "url": "#" }, { "label": "Lista de motoristas", "url": "#/motorista-listar" }, { "label": "Novo motorista", "url": "javascript:void(0)" }];
  visible: boolean = false;
  isSaving: boolean = false;
  titulo: string;
  stateOptions = [
    { label: 'Ativo', value: 1 },
    { label: 'Inativo', value: 0 }
  ];
  inatividadeOptions = TipoInatividadeDescricao;
  value: any;
  ptBr: any;
  isButtonDisabled = false;
  isMotivoSelected = false;
  isDemissao = false;
  vinculosDialogVisible: boolean = false; // Controla a visibilidade do diálogo
  vinculosAtivos: any[] = []; // Armazena os vínculos encontrados





  @Input()
  id: number;
  mensagemErroAfastamento: string;
  isAfastamentoInvalido: boolean;

  constructor(private router: Router,
    private fb: FormBuilder,
    public route: ActivatedRoute,
    private motoristaService: MotoristaService,
    private messageService: MessageService,
    private orgaoLocalService: OrgaoLocalService, // Adicionado
    private motoristaAfastamentoService: MotoristaAfastamentoService,
  ) {

    this.informacoesForm = this.fb.group({
      cpf: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]{11}$')]],
      matricula: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      cnh: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]{11}$')]],
      codCategoriaCnh: [null, Validators.required],
      validadeCnh: [null, Validators.required],
      lotacao: [null, Validators.required],
      sublotacao: ['', Validators.required],
      cep: [{ value: '', disabled: true }],
      logradouro: [{ value: '', disabled: true }],
      numLogradouro: [{ value: '', disabled: true }],
      complemento: [{ value: '', disabled: true }],
      bairro: [{ value: '', disabled: true }],
      nomeMunicipio: [{ value: '', disabled: true }],
      nomeUF: [{ value: '', disabled: true }],
      numTelefone: ['', Validators.required],
      staMotorista: [1, Validators.required],
      codAfastamento: [''],
      datIniAfastamento: [{ value: null, disabled: true }],
      datFimAfastamento: [{ value: null, disabled: true }]
    }, { validator: this.compararDatas('datIniAfastamento', 'datFimAfastamento') });
  }

  ngOnInit(): void {
    this.informacoesForm.get('lotacao')?.valueChanges.subscribe(value => {
      this.onLotacaoChange(value?.key);
    });

    this.carregarOrgaosLocais();
    this.carregarCategoriasCnh();

    if (!this.id && this.route.snapshot.params["id"]) {
      this.id = this.route.snapshot.params["id"];
      this.breadcrumbs = [{ "label": "Início", "url": "#" }, { "label": "Lista de motoristas", "url": "#/motorista-listar" }, { "label": "Editar Motorista", "url": "javascript:void(0)" }];
      this.informacoesForm.get('codAfastamento').setValidators(Validators.required);
      this.informacoesForm.get('datIniAfastamento').setValidators(Validators.required);
      this.informacoesForm.get('datFimAfastamento').setValidators(Validators.required);
      this.motoristaService.buscarPorId(this.id).subscribe(
        (res: Motorista) => {
          this.motorista = res;
          this.informacoesForm.get('matricula').setValue(res.matricula);
          this.consultarPorMatricula();
          this.informacoesForm.get('cnh').setValue(res.cnh);
          this.informacoesForm.get('codCategoriaCnh').setValue(this.buscarCategoriasCnhPorId(res.codCategoriaCnh));
          this.informacoesForm.get('validadeCnh').setValue(new Date(res.validadeCnh));
          this.informacoesForm.get('numTelefone').setValue(res.numTelefone);
          this.informacoesForm.get('staMotorista').setValue(res.staMotorista);
          this.informacoesForm.get('codAfastamento').setValue(this.buscarCodAfastamentoPorId(res.motoristaAfastamento.codAfastamento));
          this.informacoesForm.get('datIniAfastamento').setValue(res.motoristaAfastamento?.datIniAfastamento ? new Date(res.motoristaAfastamento.datIniAfastamento) : null);
          this.informacoesForm.get('datFimAfastamento').setValue(res.motoristaAfastamento?.datFimAfastamento ? new Date(res.motoristaAfastamento.datFimAfastamento) : null);

        },
        (error: any) => console.error('Erro ao carregar motoristas', error)
      );
    }

    this.informacoesForm.get('staMotorista')?.valueChanges.subscribe(value => {
      if (value === 0) {
        this.informacoesForm.get('codAfastamento')?.enable();
      } else {
        this.informacoesForm.get('codAfastamento')?.disable();
        this.informacoesForm.get('codAfastamento')?.setValue(null);
        this.informacoesForm.get('datIniAfastamento')?.disable();
        this.informacoesForm.get('datFimAfastamento')?.disable();
        this.informacoesForm.get('datIniAfastamento')?.setValue(null);
        this.informacoesForm.get('datFimAfastamento')?.setValue(null);
      }
    });


    const demissaoLabel = 'Demissão';
    const demissaoValue = TipoInatividade.DEMISSAO;


    this.informacoesForm.get('codAfastamento')?.valueChanges.subscribe(value => {




      this.isMotivoSelected = !!value;
      this.isDemissao = value === demissaoValue;


      this.obterLabelPorValorId(value)
      if (this.isMotivoSelected && !this.isDemissao) {
        this.informacoesForm.get('datIniAfastamento')?.enable();
        this.informacoesForm.get('datFimAfastamento')?.enable();
      } else if (this.isMotivoSelected && this.isDemissao) {
        this.informacoesForm.get('datIniAfastamento')?.enable();
        this.informacoesForm.get('datFimAfastamento')?.disable();
        this.informacoesForm.get('datFimAfastamento')?.setValue(null);
      } else {
        this.informacoesForm.get('datIniAfastamento')?.disable();
        this.informacoesForm.get('datIniAfastamento')?.setValue(null);
        this.informacoesForm.get('datFimAfastamento')?.disable();
        this.informacoesForm.get('datFimAfastamento')?.setValue(null);
      }
    });
    this.setTitulo(this.id);
  }

  obterLabelPorValorId(valor: number): string | undefined {
    const descricao = TipoInatividadeDescricaoId.find(item => item.value === valor);
    return descricao?.label;
  }

  setTitulo(id) {
    if (id) {
      this.titulo = "ALTERAR ";
    } else {
      this.titulo = "NOVA ";
    }
  }

  buscarLabelPorValor(valor: TipoInatividade): string | null {
    const tipoInatividade = TipoInatividadeDescricao.find(item => item.value === valor);
    return tipoInatividade ? tipoInatividade.label : null;
  }

  consultarPorCPF(): void {
    const cpfControl = this.informacoesForm.get('cpf');
    const cpf = cpfControl?.value.replace(/\D/g, ''); // Remove todos os caracteres que não são números
  
    if (cpfControl && cpf.length === 11) { // Verifica se o CPF é válido e tem 11 dígitos
      this.motoristaService.getMotoristaPorCpf(cpf).subscribe({
        next: (motorista: Motorista) => {
          this.CpfNotFound = false;
          this.pessoa = motorista.pessoa;
  
          this.informacoesForm.patchValue({
            cep: this.pessoa?.cep,
            complemento: this.pessoa?.complemento,
            telefone: this.motorista?.numTelefone
          });
  
          cpfControl?.disable(); // Desativa o campo de CPF após o sucesso
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erro ao buscar motorista:', error);
  
          if (error.error && error.error.error === "O CPF informado já está cadastrado.") {
            cpfControl?.setErrors({ 'alreadyRegistered': true });
          } else {
            this.CpfNotFound = true;
            cpfControl?.setErrors({ 'notFound': true });
          }
        }
      });
    } else {
      if (cpfControl?.hasError('required')) {
        console.error('CPF é obrigatório.');
      }
      if (cpfControl?.hasError('minlength') || cpfControl?.hasError('maxlength')) {
        console.error('O campo deve conter 11 caracteres.');
      }
    }
  }  

  consultarPorMatricula() {
    const idControl = this.informacoesForm.get('id'); // Caso você ainda queira obter o controle de id, mantenha essa linha

    if (this.id) { // Verifique se this.id está definido
      this.motoristaService.getDadosMotoristaParaEdicao(this.id).subscribe({
        next: (motorista: Motorista) => {
          this.CpfNotFound = false;
          this.pessoa = motorista.pessoa;
          let cpf = null;
          if (this.pessoa) {
            cpf = this.pessoa.codigoPessoa + "";
            cpf = cpf.padStart(11, '0');
          }
          this.informacoesForm.patchValue({
            cep: this.pessoa?.cep,
            complemento: this.pessoa?.complemento,
            telefone: this.motorista?.numTelefone,
            cpf: cpf
          });
          if (idControl) {
            idControl.disable(); // Desabilita o controle se necessário
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erro ao buscar motorista:', error);

          // Acessando a mensagem de erro corretamente
          if (error.error && error.error.error === "O CPF informado já está cadastrado.") {
            if (idControl) {
              idControl.setErrors({ 'alreadyRegistered': true });
            }
          } else {
            this.CpfNotFound = true;
            if (idControl) {
              idControl.setErrors({ 'notFound': true });
            }
          }
        }
      });
    } else {
      console.error('ID do motorista não está definido.');
    }
  }

  salvarMotorista() {
    if (this.informacoesForm.invalid) {
      Object.keys(this.informacoesForm.controls).forEach(field => {
        const control = this.informacoesForm.get(field);
        if (control?.invalid) {
        }
      });
      this.informacoesForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    const numTelefoneValue = this.informacoesForm.get('numTelefone').value.replace(/\D/g, '')
    const codCategoriaCnhValue = this.informacoesForm.get('codCategoriaCnh').value;
    const lotacaoValue = this.informacoesForm.get('lotacao').value;
    const sublotacaoValue = this.informacoesForm.get('sublotacao').value;
    const motoristaPayload = {
      pessoaId: this.pessoa.seqPessoa,
      staMotorista: 1,
      matricula: this.informacoesForm.get('matricula').value,
      cnh: this.informacoesForm.get('cnh').value,
      codCategoriaCnh: codCategoriaCnhValue ? codCategoriaCnhValue.key : null,
      validadeCnh: this.informacoesForm.get('validadeCnh').value,
      orgaoLotacao: lotacaoValue ? lotacaoValue.key : null,
      orgaoSublotacao: sublotacaoValue ? sublotacaoValue.key : null,
      numTelefone: numTelefoneValue,
    };
    this.motoristaService.cadastrarMotorista(motoristaPayload).subscribe({
      next: (resposta: Motorista) => {
        this.showDialog();
        this.informacoesForm.disable()

      },
      error: (err) => {
        this.isSaving = false;
      }
    });
  }

  formatarDataParaBackend(data: string): string {
    const dataObj = new Date(data);
    return dataObj.toISOString().split('T')[0];
  }


  editarMotorista() {
    if (this.informacoesForm.invalid) {
      Object.keys(this.informacoesForm.controls).forEach(field => {
        const control = this.informacoesForm.get(field);
        if (control?.invalid) {
          console.log(`Campo inválido: ${field}`, control.errors);
        }
      });
      this.informacoesForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const numTelefoneValue = this.informacoesForm.get('numTelefone').value.replace(/\D/g, '');
    const formData = this.informacoesForm.value;
    const codCategoriaCnhValue = this.informacoesForm.get('codCategoriaCnh').value;
    const lotacaoValue = this.informacoesForm.get('lotacao').value;
    const sublotacaoValue = this.informacoesForm.get('sublotacao').value;
    const staMotoristaValue = this.informacoesForm.get('staMotorista').value;

    const motoristaPayload: any = {
      id: this.id,
      pessoaId: this.pessoa.seqPessoa,
      staMotorista: staMotoristaValue,
      //cpf: this.informacoesForm.get('cpf').value,
      matricula: this.informacoesForm.get('matricula').value,
      cnh: this.informacoesForm.get('cnh').value,
      codCategoriaCnh: codCategoriaCnhValue ? codCategoriaCnhValue.key : null,
      validadeCnh: this.informacoesForm.get('validadeCnh')?.value,
      orgaoLotacao: lotacaoValue ? lotacaoValue.key : null,
      orgaoSublotacao: sublotacaoValue ? sublotacaoValue.key : null,
      numTelefone: numTelefoneValue,

    };

    if (staMotoristaValue === 0) {

      const datIniAfastamento = this.informacoesForm.get('datIniAfastamento')?.value;
      const datFimAfastamento = this.informacoesForm.get('datFimAfastamento')?.value;
      const codAfastamentoValue = this.informacoesForm.get('codAfastamento')?.value;

      if (datIniAfastamento || datFimAfastamento || codAfastamentoValue) {
        motoristaPayload.motoristaAfastamento = {};

        if (datIniAfastamento) {
          motoristaPayload.motoristaAfastamento.datIniAfastamento = datIniAfastamento;
        }

        if (datFimAfastamento) {
          motoristaPayload.motoristaAfastamento.datFimAfastamento = datFimAfastamento;
        }

        if (codAfastamentoValue) {
          motoristaPayload.motoristaAfastamento.codAfastamento = codAfastamentoValue.value | codAfastamentoValue.key;
        } else {
          console.warn('CodAfastamento não está presente no formulário.');
        }
      }
    } else {
    }


    this.motoristaService.editarMotorista(this.id, motoristaPayload).subscribe({
      next: (resposta: Motorista) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Motorista editado com sucesso!',
          life: 4000
        });
        this.router.navigate(['/motorista-listar']);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Erro ao salvar motorista:', err);
      }
    });
  }

  //concatena tudo do endereço
  getEnderecoCompleto(): string {
    if (!this.pessoa) {
      return '';
    }
    return `${this.pessoa.logradouro}, ${this.pessoa.numLogradouro} - ${this.pessoa.bairro} - ${this.pessoa.nomeMunicipio}, ${this.pessoa.nomeUF}`;
  }

  //carrega as sublotações de acordo com o id
  onLotacaoChange(id: any): void {
    this.informacoesForm.get('sublotacao')?.setValue(null);
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

      if (this.id && orgao.id == this.motorista.orgaoSublotacao)
        this.informacoesForm.get('sublotacao').setValue(node);


      if (orgao.orgaoLocalPai !== null && map.has(orgao.orgaoLocalPai)) {
        map.get(orgao.orgaoLocalPai).children.push(node);
      }
    });
    return Array.from(map.values()).filter(node => node.key !== null);
  }

  //traz categorias cnh
  carregarCategoriasCnh() {
    CategoriaCnhDescricao.find(item => {
      this.treeData.push({
        label: item.label,
        data: item,
        key: item.value
      });
    });
  }

  buscarCategoriasCnhPorId(id: any) {
    let categoria = null;
    CategoriaCnhDescricao.find(item => {
      if (item.value == id) {
        categoria = {
          label: item.label,
          data: item,
          key: item.value
        };
      }
    });
    return categoria;
  }

  buscarCodAfastamentoPorId(id: any): any {
    let codigo = null;
    TipoInatividadeDescricao.find(item => {
      if (item.value == id) {
        codigo = {
          label: item.label,
          data: item,
          key: item.value
        };
      }
    });
    return codigo;
  }

  //traz os orgãos locais
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
      console.log(orgao)
      map.set(orgao.id, node);
      if (this.id && orgao.id == this.motorista.orgaoLotacao) {
        this.informacoesForm.get('lotacao').setValue(node);
      }
      if (orgao.orgaoLocalPai !== null && map.has(orgao.orgaoLocalPai)) {
        map.get(orgao.orgaoLocalPai).children.push(node);
      }
    });
    return Array.from(map.values()).filter(node => node.key !== null);
  }

  //reseta o formulário completo  
  resetForm(): void {
    this.informacoesForm.reset();
    this.informacoesForm.get('cpf')?.setValue('');
    this.informacoesForm.get('cpf')?.markAsUntouched();
    this.pessoa = undefined;
    this.informacoesForm.controls['cpf'].enable();
    this.isSaving = false;
  }

  // Validador personalizado para CNH
  cnhValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const isValid = /^\d{11}$/.test(value);
    return isValid ? null : { invalidCnh: true };
  }

  // Validador personalizado para matrícula
  matriculaValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    // Verifica se o valor está entre 4 e 8 caracteres
    const isValid = /^\d{4,8}$/.test(value);
    return isValid ? null : { invalidMatricula: true };
  }


  // Filtra caracteres não numéricos no campo CNH
  onCnhInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    this.informacoesForm.get('cnh').setValue(input.value); // Atualiza o valor no FormGroup
  }

  onMatriculaInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Remove todos os caracteres que não sejam letras ou números
    input.value = input.value.replace(/[^A-Za-z0-9]/g, '');
    // Atualiza o valor no FormGroup
    this.informacoesForm.get('matricula').setValue(input.value);
  }


  onCpfInput(event: Event): void {
    let input = (event.target as HTMLInputElement).value.replace(/\D/g, ''); // Remove tudo que não for número
  
    // Limita a quantidade de caracteres a 11
    if (input.length > 11) {
      input = input.substring(0, 11);
    }
  
    // Aplica a máscara: 123.456.789-01
    if (input.length > 9) {
      input = input.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (input.length > 6) {
      input = input.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
    } else if (input.length > 3) {
      input = input.replace(/(\d{3})(\d{3})/, '$1.$2');
    }
  
    // Atualiza o valor no FormGroup
    this.informacoesForm.get('cpf').setValue(input);
  }
  
  showDialog() {
    this.visible = true;
  }

  irParaListaDeMotoristas() {
    this.router.navigate(['/motorista-listar']);
  }

  cadastrarNovoMotorista() {
    this.resetForm()
    this.router.navigate(['/motorista-criar-novo']);
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

  carregarTiposInatividades() {
    this.inatividadeOptions = TipoInatividadeDescricao.map(item => ({
      label: item.label,
      key: item.key,
      value: item.value
    }));
  }

  isMotoristaInativo(): boolean {
    return this.informacoesForm.get('staMotorista')?.value === 'inativo' && this.id !== null;
  }

  // Validação customizada para comparar as datas de início e fim
  compararDatas(dataInicioKey: string, dataFimKey: string) {
    return (formGroup: FormGroup) => {
      const dataInicioControl = formGroup.controls[dataInicioKey];
      const dataFimControl = formGroup.controls[dataFimKey];

      if (dataInicioControl && dataFimControl) {
        const dataInicio = new Date(dataInicioControl.value);
        const dataFim = new Date(dataFimControl.value);

        if (dataInicioControl.value && dataFimControl.value && dataInicio > dataFim) {
          dataFimControl.setErrors({ dataInvalida: true });
        } else {
          dataFimControl.setErrors(null);  // Limpa o erro se as datas forem válidas
        }
      }
    };
  }

  onDateFimSelect() {
    const datIniAfastamento = this.informacoesForm.get('datIniAfastamento')?.value;
    const datFimAfastamento = this.informacoesForm.get('datFimAfastamento')?.value;

    // Limpa a lista de vínculos ativos e esconde o modal inicialmente
    this.vinculosAtivos = [];
    this.vinculosDialogVisible = false;
    this.isAfastamentoInvalido = false; // Resetando o estado do afastamento inválido
    this.mensagemErroAfastamento = ''; // Resetando a mensagem de erro

    if (datIniAfastamento && datFimAfastamento) {

      // Verificar vínculos por período (lógica original)
      this.motoristaService.verificarVinculosPorPeriodo(this.id, datIniAfastamento, datFimAfastamento).subscribe((vinculosAtivos: any[]) => {
        if (vinculosAtivos && vinculosAtivos.length > 0) {
          this.vinculosAtivos = vinculosAtivos; // Armazena os vínculos encontrados
          this.vinculosDialogVisible = true;   // Exibe o modal se houver vínculos
        } else {
          this.vinculosAtivos = [];  // Garante que a lista seja esvaziada
          this.vinculosDialogVisible = false;  // Garante que o modal não seja exibido
        }
      }, err => {
        console.error('Erro ao verificar vínculos:', err);
        this.vinculosAtivos = [];  // Garante que a lista seja esvaziada em caso de erro
        this.vinculosDialogVisible = false;  // Garante que o modal não seja exibido
      });

      // Verificar se já existe afastamento para o período selecionado
      this.motoristaAfastamentoService.verificarAfastamentoExistente(this.id, datIniAfastamento, datFimAfastamento).subscribe(
        (afastamentosConflitantes: AfastamentoModel[]) => {
          if (afastamentosConflitantes && afastamentosConflitantes.length > 0) {
            this.isAfastamentoInvalido = true; // Bloqueia o formulário para submissão
            const afastamentoAtual = afastamentosConflitantes[0]; // Pega o afastamento conflitante

            // Tratando as datas para exibir no formato dd/MM/yyyy
            const inicioAfastamento = new Date(afastamentoAtual.datIniAfastamento).toLocaleDateString('pt-BR');
            const fimAfastamento = afastamentoAtual.datFimAfastamento
              ? new Date(afastamentoAtual.datFimAfastamento).toLocaleDateString('pt-BR')
              : 'Atualmente ativo';

            this.mensagemErroAfastamento = `Já existe um afastamento registrado para o motorista no período de ${inicioAfastamento} até ${fimAfastamento}.`;
          } else {
            this.isAfastamentoInvalido = false; // Libera o formulário para submissão
            this.mensagemErroAfastamento = ''; // Garante que a mensagem seja limpa se não houver afastamento
          }
        },
        (error) => {
          console.error('Erro ao verificar afastamentos:', error);
          this.isAfastamentoInvalido = true; // Bloqueia o formulário em caso de erro
          this.mensagemErroAfastamento = 'Erro ao verificar afastamentos. Por favor, tente novamente.';
        }
      );

    } else {
      // Se as datas forem inválidas, limpa os vínculos e esconde o modal
      this.vinculosAtivos = [];
      this.vinculosDialogVisible = false;
      this.isAfastamentoInvalido = false; // Resetando para permitir nova validação
      this.mensagemErroAfastamento = ''; // Limpa a mensagem de erro ao limpar datas
    }
  }





  formatarPlaca(placa: string): string {
    if (placa && placa.length === 7) {
      // Insere um traço na 4ª posição
      return `${placa.substring(0, 3)}-${placa.substring(3)}`;
    }
    return placa; // Retorna a placa como está se o formato não for esperado
  }



}