import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { AccordionModule } from 'primeng/accordion';
import { MessageService } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';
import { PaginatorModule } from 'primeng/paginator';
import { TreeSelectModule } from 'primeng/treeselect';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { ClienteService } from '../cliente.service';
import { ClienteCNPJ } from './clienteCNPJ.model';
import { Sintegra } from './sintegra.model';



@Component({
  selector: 'app-cliente-consultar-novo',
  standalone: true,
  imports: [ReactiveFormsModule, PrimeNgModule, AccordionModule, PaginatorModule, BreadcrumbModule, CommonModule, TreeSelectModule, InputMaskModule],
  templateUrl: './cliente-consultar-novo.component.html',
  styleUrls: ['./cliente-consultar-novo.component.css']
})
export class ClienteConsultarNovoComponent {
  breadcrumbs: any = [{ "label": "Início", "url": "#" }, { "label": "Nova consulta", "url": "javascript:void(0)" }];
  cnpjForm: FormGroup;
  cliente?: ClienteCNPJ;
  sintegraForm: FormGroup;
  errorMessage: string = '';
  ufs = [
    { key: 'AC', label: 'Acre' },
    { key: 'AL', label: 'Alagoas' },
    { key: 'AP', label: 'Amapá' },
    { key: 'AM', label: 'Amazonas' },
    { key: 'BA', label: 'Bahia' },
    { key: 'CE', label: 'Ceará' },
    { key: 'DF', label: 'Distrito Federal' },
    { key: 'ES', label: 'Espírito Santo' },
    { key: 'GO', label: 'Goiás' },
    { key: 'MA', label: 'Maranhão' },
    { key: 'MT', label: 'Mato Grosso' },
    { key: 'MS', label: 'Mato Grosso do Sul' },
    { key: 'MG', label: 'Minas Gerais' },
    { key: 'PA', label: 'Pará' },
    { key: 'PB', label: 'Paraíba' },
    { key: 'PR', label: 'Paraná' },
    { key: 'PE', label: 'Pernambuco' },
    { key: 'PI', label: 'Piauí' },
    { key: 'RJ', label: 'Rio de Janeiro' },
    { key: 'RN', label: 'Rio Grande do Norte' },
    { key: 'RS', label: 'Rio Grande do Sul' },
    { key: 'RO', label: 'Rondônia' },
    { key: 'RR', label: 'Roraima' },
    { key: 'SC', label: 'Santa Catarina' },
    { key: 'SP', label: 'São Paulo' },
    { key: 'SE', label: 'Sergipe' },
    { key: 'TO', label: 'Tocantins' }
  ];

  sintegraData: Sintegra;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private messageService: MessageService,
    private router: Router
  ) {
    // Form para consulta de CNPJ
    this.cnpjForm = this.fb.group({
      cnpj: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]]
    });

    // Form para consulta no Sintegra
    this.sintegraForm = this.fb.group({
      cnpj: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      uf: ['', Validators.required]
    });
  }


  consultarCNPJ(): void {
    const cnpjControl = this.cnpjForm.get('cnpj');
    const cnpj = cnpjControl?.value;

    if (cnpjControl?.valid) {
      this.clienteService.consultarClientePorCNPJ(cnpj).subscribe(
        (data: ClienteCNPJ) => {
          this.cliente = data;
          console.log('Dados recebidos:', this.cliente);
        },
        error => {
          console.error('Erro ao buscar cliente:', error);
          this.errorMessage = 'Erro ao buscar dados do CNPJ. Tente novamente.';
        }
      );
    } else {
      console.error('CNPJ inválido');
    }
  }

  consultarSintegra(): void {
    const cnpj = this.sintegraForm.get('cnpj')?.value;
    const uf = this.sintegraForm.get('uf')?.value;

    if (this.sintegraForm.valid) {
      this.clienteService.consultarSintegra(cnpj, uf).subscribe(
        (data: Sintegra) => {
          this.sintegraData = data;
          console.log('Dados do Sintegra recebidos:', this.sintegraData);
        },
        error => {
          console.error('Erro ao consultar Sintegra:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao consultar o Sintegra. Tente novamente.'
          });
        }
      );
    } else {
      console.error('Formulário inválido');
      this.messageService.add({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'Preencha os campos obrigatórios corretamente.'
      });
    }
  }

  adicionarCliente() {
    this.router.navigate(['/cliente-criar-novo'], {
      queryParams: {
        cnpj: this.cliente.cnpj,
        nome: this.cliente.nome,
        telefone: this.cliente.telefone,
        email: this.cliente.email
      }
    });
  }


}
