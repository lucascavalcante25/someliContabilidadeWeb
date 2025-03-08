import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InputMaskModule } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { TreeSelectModule } from 'primeng/treeselect';
import { ClienteService } from '../cliente.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogModule } from 'primeng/dialog';


@Component({
  selector: 'app-cliente-criar-novo',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    PrimeNgModule,
    BreadcrumbModule,
    InputMaskModule,
    DropdownModule,
    TreeSelectModule,
    ToastModule,
    OverlayPanelModule,
    ProgressSpinnerModule, DialogModule],
  templateUrl: './cliente-criar-novo.component.html',
  styleUrl: './cliente-criar-novo.component.css',
  providers: [MessageService] // ✅ Adicionando MessageService para exibir mensagens

})
export class ClienteCriarNovoComponent {
  breadcrumbs: any = [{ "label": "Início", "url": "#" }, { "label": "Nova consulta", "url": "javascript:void(0)" }];

  tiposPagamento = [
    { key: 1, label: 'Física' },
    { key: 2, label: 'Jurídica' },
    { key: 3, label: 'Terceiros' }
  ];

  pagamentoSelecionado: string | null = null;

  diasVencimento = [
    { key: 1, label: '1' },
    { key: 5, label: '5' },
    { key: 10, label: '10' },
    { key: 15, label: '15' },
    { key: 20, label: '20' },
    { key: 25, label: '25' },
    { key: 30, label: '30' }
  ];

  diaSelecionado: number | null = null;

  clienteForm: FormGroup;
  isFormValid: boolean = false; // Estado inicial do formulário
  isLoading = false; // Controla a exibição do spinner

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService,
    private messageService: MessageService

  ) {
    this.clienteForm = this.fb.group({
      cnpj: ['', Validators.required],
      nome: ['', Validators.required],  // Mapeia para "RAZAO_SOCIAL" no backend
      nomeProprietario: ['', Validators.required], // Novo campo
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      honorario: ['', Validators.required],
      vencimento: [null, Validators.required],
      pagamento: [null, Validators.required]
    });
  }


  ngOnInit() {
    // Garante que o formulário inicie inválido
    this.isFormValid = this.clienteForm.valid; // Atualiza o estado inicial

    // Monitorar mudanças no formulário
    this.clienteForm.valueChanges.subscribe(() => {
      this.isFormValid = this.clienteForm.valid; // Atualiza o botão dinamicamente
    });
  }


  limparFormulario(): void {
    this.clienteForm.reset();

    this.clienteForm.patchValue({
      cnpj: '',
      nome: '',
      telefone: '',
      email: '',
      honorario: '',
      vencimento: null,
      pagamento: null
    });
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
    this.clienteForm.get('cnpj')?.setValue(cnpj, { emitEvent: false });

    return cnpj;
  }




  applyPhoneMask(value: string): string {
    let phone = value.replace(/\D/g, '');
    if (phone.length > 11) {
      phone = phone.slice(0, 11);
    }
    if (phone.length <= 10) {
      phone = phone.replace(/^(\d{2})(\d)/, '($1) $2');
      phone = phone.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      phone = phone.replace(/^(\d{2})(\d)/, '($1) $2');
      phone = phone.replace(/(\d{5})(\d)/, '$1-$2');
    }
    this.clienteForm.get('telefone')?.setValue(phone, { emitEvent: false });

    return phone;
  }

  telefoneValidator(control: FormControl) {
    const value = control.value?.replace(/\D/g, ''); // Remove tudo que não for número
    if (!value || value.length < 10 || value.length > 11) {
      return { telefoneInvalido: true };
    }
    return null;
  }


  applyCurrencyMask(value: string): string {
    let numericValue = value.replace(/\D/g, '');
    if (numericValue.length > 9) {
      numericValue = numericValue.slice(0, 9);
    }
    let formattedValue = (parseFloat(numericValue) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    this.clienteForm.get('honorario')?.setValue(formattedValue, { emitEvent: false });

    return formattedValue;
  }

  applyDateMask(value: string): string {
    let date = value.replace(/\D/g, '');
    if (date.length > 8) {
      date = date.slice(0, 8);
    }
    date = date.replace(/^(\d{2})(\d)/, '$1/$2');
    date = date.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    this.clienteForm.get('vencimento')?.setValue(date, { emitEvent: false });

    return date;
  }


  salvarCliente() {
    if (this.clienteForm.invalid) {
      return;
    }

    this.isLoading = true; // 🔄 Exibe o spinner antes do envio

    const cliente = {
      nome: this.clienteForm.value.nome,
      nomeProprietario: this.clienteForm.value.nomeProprietario,
      cnpj: this.clienteForm.value.cnpj.replace(/\D/g, ''), // Remove pontuação
      telefone: this.clienteForm.value.telefone,
      email: this.clienteForm.value.email,
      honorario: parseFloat(this.clienteForm.value.honorario.replace('R$', '').replace(',', '.')),
      vencimento: Number(this.clienteForm.value.vencimento?.key || this.clienteForm.value.vencimento),
      pagamento: Number(this.clienteForm.value.pagamento?.key || this.clienteForm.value.pagamento)
    };

    this.clienteService.salvarCliente(cliente).subscribe({
      next: (response) => {
        this.isLoading = false; // ✅ Remove o spinner
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente cadastrado com sucesso!' });
        setTimeout(() => this.router.navigate(['/cliente-listar']), 2000); // 🔄 Aguarda 2s antes de redirecionar
      },
      error: (err) => {
        this.isLoading = false; // ✅ Remove o spinner em caso de erro
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao salvar o cliente!' });
      }
    });
  }


}