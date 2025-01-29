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
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' }
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

}
