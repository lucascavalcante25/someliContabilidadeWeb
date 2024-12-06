import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
import { ConsultaManutencoesService } from './consulta-manutencoes.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-consulta-manutencoes',
  standalone: true,
  imports: [
    ProgressSpinnerModule,
    ReactiveFormsModule,
    PrimeNgModule,
    AccordionModule,
    DividerModule,
    BreadcrumbModule,
    PaginatorModule,
    HttpClientModule,
    CommonModule,
    ToastModule,
  ],
  templateUrl: './consulta-manutencoes.component.html',
  styleUrls: ['./consulta-manutencoes.component.css'],
})
export class ConsultaManutencoesComponent {
  informacoesForm: FormGroup; // Formulário reativo
  manutencoes: any[] = [];
  breadcrumbs: any = [
    { label: 'Início', url: '#' },
    { label: 'Consulta Manutenções', url: '#/consulta-manutencoes' },
  ];
  ptBr: any;
  // Valores padrão para os inputs
  // CodigoEmpresa: string = '000679000021';
  // MesPeriodo: string = '04/2024';


  constructor(
    private router: Router,
    private fb: FormBuilder,
    public route: ActivatedRoute,
    private consultaManutencoesService: ConsultaManutencoesService
  ) {
    // Inicializa o formulário com os valores padrão
    this.informacoesForm = this.fb.group({
      CodigoEmpresa: ['000679000021', Validators.required],
      MesPeriodo: ['04/2024', Validators.required],
    });
  }

  buscarManutencoes() {
    if (this.informacoesForm.invalid) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const payload = this.informacoesForm.value;
    console.log(payload);

    // Chama o método do serviço
    this.consultaManutencoesService.buscarManutencoesVolus(payload).subscribe(
      (data) => {
        console.log('Dados recebidos:', data); // Log para verificar o tipo de dado retornado
        this.manutencoes = Array.isArray(data) ? data : []; // Certifique-se de que é um array
      },
      (error) => {
        console.error('Erro ao buscar dados:', error);
        alert('Erro ao buscar os dados. Tente novamente mais tarde.');
      }
    );
  }

}

