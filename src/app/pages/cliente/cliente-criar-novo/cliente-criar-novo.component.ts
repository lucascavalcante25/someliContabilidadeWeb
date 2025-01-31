import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { InputMaskModule } from 'primeng/inputmask';
import { PaginatorModule } from 'primeng/paginator';
import { TreeSelectModule } from 'primeng/treeselect';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';


@Component({
  selector: 'app-cliente-criar-novo',
  standalone: true,
  imports: [ReactiveFormsModule, PrimeNgModule, AccordionModule, PaginatorModule, BreadcrumbModule, CommonModule, TreeSelectModule, InputMaskModule, BreadcrumbModule],
  templateUrl: './cliente-criar-novo.component.html',
  styleUrl: './cliente-criar-novo.component.css'
})
export class ClienteCriarNovoComponent {
  breadcrumbs: any = [{ "label": "Início", "url": "#" }, { "label": "Nova consulta", "url": "javascript:void(0)" }];
  clienteForm: FormGroup;
  tiposPagamento = [
    { label: 'Física', value: 'fisica' },
    { label: 'Jurídica', value: 'juridica' },
    { label: 'Terceiro/Sócio', value: 'terceiro' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.clienteForm = this.fb.group({
      cnpj: [{ value: '', disabled: true }, Validators.required],
      nome: [{ value: '', disabled: true }, Validators.required],
      telefone: [''],
      email: [''],
      honorario: ['', Validators.required],
      vencimento: ['', Validators.required],
      pagamento: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['cnpj']) {
        this.clienteForm.patchValue({
          cnpj: params['cnpj'],
          nome: params['nome'],
          telefone: params['telefone'] || '',
          email: params['email'] || ''
        });
      }
    });
  }

  salvarCliente() {
    console.log("Cliente salvo:", this.clienteForm.value);
    // Adicione aqui a chamada ao serviço de cadastro do backend
    this.router.navigate(['/clientes']);
  }
  cancelar() {
    // Redireciona para a tela de consulta de clientes ou outra página desejada
    this.router.navigate(['/clientes']);
  }
}

