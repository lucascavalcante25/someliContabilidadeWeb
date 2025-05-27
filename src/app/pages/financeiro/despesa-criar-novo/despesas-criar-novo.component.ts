import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { DespesaService } from '../despesa.service';
import { ActivatedRoute, Router } from '@angular/router';
import { InputNumberModule } from 'primeng/inputnumber';
import { TreeSelectModule } from 'primeng/treeselect';

@Component({
  selector: 'app-despesas-criar-novo',
  standalone: true,
  templateUrl: './despesas-criar-novo.component.html',
  styleUrls: ['./despesas-criar-novo.component.css'],
  providers: [MessageService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ProgressSpinnerModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    CheckboxModule,
    ToastModule,
    CardModule,
    BreadcrumbModule,
    FormsModule,
    InputNumberModule,
    TreeSelectModule
  ]
})
export class DespesasCriarNovoComponent {


  constructor(
    private fb: FormBuilder,
    private despesaService: DespesaService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.formulario = this.fb.group({
      descricao: ['', Validators.required],
      valorMensal: [null, Validators.required],
      tipo: [null, Validators.required],
      parcelas: [null],
      dataInicio: [null],
      ativa: [true],
      diaPagamento: [null]
    });

  }

  idDespesa: number | null = null;

  formulario: FormGroup;
  isLoading = false;

  tiposDespesa = [
    { key: 1, label: 'Recorrente' },
    { key: 2, label: 'Pontual' },
    { key: 3, label: 'Pessoal' }
  ];

  diasVencimento = [
    { key: 1, label: '1' },
    { key: 5, label: '5' },
    { key: 10, label: '10' },
    { key: 15, label: '15' },
    { key: 20, label: '20' },
    { key: 25, label: '25' },
    { key: 30, label: '30' }
  ];


  ptBr: any;

  breadcrumbs = [
    { label: 'Início', url: '/index' },
    { label: 'Lista de despesas', url: '/despesas-listar' },
    { label: 'Nova despesa', url: '/despesas-criar-novo' }
  ];
  formAlterado = false;

  ngOnInit(): void {
    this.ptBr = {
      firstDayOfWeek: 0,
      dayNames: ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"],
      dayNamesShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
      dayNamesMin: ["D", "S", "T", "Q", "Q", "S", "S"],
      monthNames: [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
      ],
      monthNamesShort: [
        "jan", "fev", "mar", "abr", "mai", "jun",
        "jul", "ago", "set", "out", "nov", "dez"
      ],
      today: 'Hoje',
      clear: 'Limpar',
      dateFormat: 'dd/mm/yy'
    };
    this.idDespesa = Number(this.route.snapshot.paramMap.get('id'));

    this.breadcrumbs[2] = {
      label: this.idDespesa ? 'Editar despesa' : 'Nova despesa',
      url: this.idDespesa ? `/despesas-criar-novo/${this.idDespesa}` : '/despesas-criar-novo'
    };

    if (this.idDespesa) {
      this.despesaService.buscarPorId(this.idDespesa).subscribe({
        next: (despesa) => {
          console.log('Despesa carregada', despesa),
            this.formulario.patchValue({
              descricao: despesa.descricao,
              valorMensal: Number(despesa.valorMensal),
              tipo: this.tiposDespesa.find(t => t.key === despesa.tipo),
              parcelas: despesa.parcelas,
              diaPagamento: despesa.diaPagamento,
              dataInicio: new Date(despesa.dataInicio),
              ativa: despesa.ativa
            });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível carregar a despesa.'
          });
          this.router.navigate(['/despesas-listar']);
        }
      });
    }

    this.formulario.get('tipo')?.valueChanges.subscribe(value => {
      const tipo = value?.key ?? value;
      const diaPagamentoControl = this.formulario.get('diaPagamento');

      if (tipo === 3) {
        diaPagamentoControl?.setValidators([Validators.required]);
      } else {
        diaPagamentoControl?.clearValidators();
        diaPagamentoControl?.setValue(null);
      }

      diaPagamentoControl?.updateValueAndValidity();
    });



  }

  salvarDespesa(): void {
    if (this.formulario.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos obrigatórios',
        detail: 'Preencha todos os campos corretamente.'
      });
      return;
    }

    const form = this.formulario.value;

    const despesa = {
      descricao: form.descricao?.trim(),
      valorMensal: form.valorMensal,
      tipo: form.tipo?.key ?? form.tipo,
      parcelas: form.parcelas,
      dataInicio: form.dataInicio,
      diaPagamento: (form.tipo?.key ?? form.tipo) === 3 ? (form.diaPagamento?.key ?? form.diaPagamento) : null,
      ativa: form.ativa
    };

    console.log(despesa)


    this.isLoading = true;

    if (this.idDespesa) {
      this.editarDespesa(this.idDespesa, despesa);
    } else {
      this.cadastrarDespesa(despesa);
    }
  }

  private cadastrarDespesa(despesa: any): void {
    this.despesaService.salvar(despesa).subscribe({
      next: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Despesa salva com sucesso!' });
        setTimeout(() => this.router.navigate(['/despesas-listar']), 2000)
      },
      error: err => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao salvar',
          detail: 'Não foi possível cadastrar a despesa.'
        });
      }
    });
  }

  private editarDespesa(id: number, despesa: any): void {
    this.despesaService.editar(id, despesa).subscribe({
      next: () => {
        this.isLoading = false;
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Despesa atualizada com sucesso!' });
        setTimeout(() => this.router.navigate(['/despesas-listar']), 2000);
      },
      error: err => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao editar',
          detail: 'Não foi possível editar a despesa.'
        });
      }
    });
  }

  limparFormulario(): void {
    this.formulario.reset({ ativa: true });
  }
}
