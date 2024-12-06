// import { CommonModule } from '@angular/common';
// import { Component, Input } from '@angular/core';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { MessageService, TreeNode } from 'primeng/api';
// import { InputTextareaModule } from 'primeng/inputtextarea';
// import { TreeSelectModule } from 'primeng/treeselect';
// import { BreadcrumbModule } from 'src/app/componentes/breadcrumb/breadcrumb.module';
// import { PrimeNgModule } from 'src/app/componentes/primeng/primeng.module';
// import { CodigoTipoCategoriaDescricao } from 'src/app/core/enums/codigoTipoCategoriaEnum';
// import { CodigoTipoCombustivelDescricao } from 'src/app/core/enums/codigoTipoCombustivelEnum';
// import { CodigoTipoVeiculoDescricao } from 'src/app/core/enums/codigoTipoVeiculo';
// import { tipoManutencaoEnumDescricao } from 'src/app/core/enums/tipoManutencaoEnum';
// import { OrgaoLocalService } from 'src/app/core/service/orgaoLocalService/orgaoLocal.service';
// import { OrgaoLocalDTO } from 'src/app/core/service/orgaoLocalService/orgaoLocalDTO.model';
// import { OrgaoLocalFilhoDTO } from 'src/app/core/service/orgaoLocalService/orgaoLocalFilhoDTO';
// import { IndexComponent } from 'src/app/index/index.component';
// import { Veiculo } from '../../veiculo/cliente-listar/cliente.model';
// import { VeiculoService } from '../../veiculo/cliente.service';
// import { SolicitacaoServico } from '../solicitacao-servico.model';
// import { SolicitacaoServicoService } from '../solicitacao-servico.service';


// @Component({
//   selector: 'app-soliticao-servico-criar',
//   standalone: true,
//   imports: [BreadcrumbModule, PrimeNgModule, ReactiveFormsModule, CommonModule, TreeSelectModule, InputTextareaModule, IndexComponent],
//   templateUrl: './solicitacao-servico-criar.component.html',
//   styleUrl: './solicitacao-servico-criar.component.css'
// })
// export class SolicitacaoDeServicoCriarComponent {
//   formulario: FormGroup;
//   veiculoNotFound: boolean;
//   veiculo?: Veiculo;
//   breadcrumbs: any = [{ "label": "Início", "url": "#" }, { "label": "Solicitação de serviço", "url": "#/solicitacao-servico-listar" }, { "label": "Nova solicitação", "url": "javascript:void(0)" }];
//   treeDataTipoManutencao: any[] = [];
//   TreeDataOrgaosLocais: any[] = [];
//   TreeDatasubOrgaosLocais: any = [];
//   isSaving: boolean = false;
//   solicitacaoServico: SolicitacaoServico;
//   nomeUsuario: any;
//   placasTree: TreeNode[] = [];
//   allVeiculos: Veiculo[] = [];
//   @Input()
//   id: number;
//   placaSelecionada: string | null = null;


//   constructor(
//     private fb: FormBuilder,
//     private messageService: MessageService,
//     private veiculoService: VeiculoService,
//     private orgaoLocalService: OrgaoLocalService,
//     private router: Router,
//     public route: ActivatedRoute,
//     public solicitacaoServicoService: SolicitacaoServicoService,

//   ) {

//     this.formulario = this.fb.group({
//       placa: [null, Validators.required],
//       tipoManutencao: [null, Validators.required],
//       orgaoLotacao: [null],
//       orgaoSublotacao: [null],
//       servicos: [null, Validators.required]
//     });
//   }

//   ngOnInit(): void {
//     this.veiculoService.getListaDeVeiculos().subscribe((data: Veiculo[]) => {
//       this.allVeiculos = data;
//       this.updateMotoristasTree();
//     });
//     this.carregarTipoManutencao();
//     this.carregarOrgaosLocais();

//     this.formulario.get('orgaoLotacao')?.valueChanges.subscribe(value => {
//       this.onLotacaoChange(value?.key);
//     });

//   }

//   updateMotoristasTree() {
//     this.placasTree = this.convertVeiculoToTreeNodes(this.allVeiculos);
//     console.log("Estrutura de placasTree:", this.placasTree);

//   }

//   convertVeiculoToTreeNodes(veiculos: Veiculo[]): TreeNode[] {
//     return veiculos.map((veiculo, index) => ({
//       label: veiculo.placa,      
//       value: veiculo.placa,      
//     }));
//   }


//   salvarSolicitacao() {
//     if (this.formulario.invalid) {
//       this.formulario.markAllAsTouched();
//       return;
//     }

//     this.isSaving = true;

//     const tipoManutencaoValue = this.formulario.get('tipoManutencao').value;
//     const orgaoLotacaoValue = this.formulario.get('orgaoLotacao')?.value;
//     const orgaoSublotacaoValue = this.formulario.get('orgaoSublotacao')?.value;
//     const servicosValue = this.formulario.get('servicos').value;

//     // const usuarioId = this.setUsuarioId();

//     // if (!usuarioId) {
//     //   console.error('preferred_username não encontrado no token!');
//     //   return;
//     // }

//     const payload = {
//       placa: this.formulario.get('placa').value.label,
//       dataSolicitacao: new Date().toISOString(),
//       descricaoSolicitacao: servicosValue,
//       // usuarioSolicitanteId: usuarioId,
//       dataUltimaAtualizacao: new Date().toISOString(),
//       tipoManutencao: tipoManutencaoValue ? tipoManutencaoValue.key : null,
//       orgaoLotacaoId: orgaoLotacaoValue ? orgaoLotacaoValue.key : null,
//       orgaoSublotacaoId: orgaoSublotacaoValue ? orgaoSublotacaoValue.key : null,
//       statusSolicitacaoServico: 1,
//       staEvento: 0
//     };

//     console.log('Payload:', payload);

//     this.solicitacaoServicoService.cadastrarSolicitacaoServico(payload).subscribe({
//       next: (response) => {
//         console.log('Solicitação cadastrada com sucesso', response);
//         this.router.navigate(['/solicitacao-servico-listar'], { queryParams: { sucesso: 'criado' } });
//       },
//       error: (error) => {
//         console.error('Erro ao cadastrar solicitação', error);
//       }
//     });
//   }

//   // setUsuarioId(): string | null {
//   //   const tokenParsed = this.keycloakService.getKeycloakInstance().tokenParsed;
//   //   if (tokenParsed) {
//   //     return tokenParsed['preferred_username'] || null;
//   //   }
//   //   return null;
//   // }

//   consultarPelaPlaca(): void {
//     console.log("Tentativa de buscar pela placa:", this.placaSelecionada);

//     if (this.placaSelecionada) {
//       this.solicitacaoServicoService.buscarVeiculoPorPlaca(this.placaSelecionada).subscribe(
//         data => {
//           if (data) {
//             console.log('Veículo encontrado:', data);
//             this.veiculo = {
//               chassi: data.num_chassi_vcl || '',
//               renavam: data.cod_renavam_vcl || 0,
//               codMarcaModelo: data.cod_marca_modelo_vcl || 0,
//               descricaoMarcaModelo: data.desc_marca_modelo || '',
//               cor: data.cod_cor_vcl || 0,
//               descricaoCor: data.desc_cor || '',
//               quantidadePassageiros: data.qtd_passageiros_vcl,
//               tipoCategoria: data.cod_categoria_vcl || 0,
//               tipoVeiculo: data.cod_tipo_vcl,
//               capacidadeTanque: data.capacidadeTanque || 0,
//               potencia: data.potencia ? data.potencia : data.num_potencia_vcl ? parseInt(data.num_potencia_vcl) : 0,
//               cilindrada: data.num_cilindradas_vcl || 0,
//               tipoCombustivel: data.cod_combustivel_vcl,
//               anoFabricacao: data.ano_fabricacao_vcl || 0,
//               notaFiscal: data.notaFiscal,
//               placa: data.placa
//             };

//             console.log('Dados do veículo carregados com sucesso:', this.veiculo);
//           }
//         },
//         error => {
//           console.error('Erro ao buscar veículo:', error);
//           this.veiculoNotFound = true;
//           this.veiculo = null;
//         }
//       );
//     } else {
//       console.error("Nenhum veículo selecionado.");
//     }
//   }

//   onVeiculoSelected(event: any): void {
//     console.log("Evento onNodeSelect disparado. Nó selecionado:", event.node); // Verifique o valor completo do nó
//     this.placaSelecionada = event.node.value; // Atribui o valor ao controle
//     console.log("Placa selecionada após atribuição:", this.placaSelecionada); // Verifique o valor atribuído
//   }

//   getCategoriaLabel(value: string): string {
//     const codigoStr = String(value);
//     const categoria = CodigoTipoCategoriaDescricao.find(item => item.value === codigoStr);
//     return categoria ? categoria.label : '';
//   }

//   getTipoVeiculoDescricao(value: string): string {
//     const codigoStr = String(value);
//     const tipoVeiculo = CodigoTipoVeiculoDescricao.find(item => item.value === codigoStr);
//     return tipoVeiculo ? tipoVeiculo.label : '';
//   }

//   getTipoCombustivel(value: string): string {
//     const codigoStr = String(value);
//     const tipoCombustivel = CodigoTipoCombustivelDescricao.find(item => item.value === codigoStr);
//     return tipoCombustivel ? tipoCombustivel.label : '';
//   }

//   carregarTipoManutencao() {
//     tipoManutencaoEnumDescricao.find(item => {
//       this.treeDataTipoManutencao.push({
//         label: item.label,
//         data: item,
//         key: item.value
//       });
//     });
//   }

//   carregarOrgaosLocais() {
//     this.orgaoLocalService.obterOrgaosLocaisAtivos().subscribe({
//       next: (data: OrgaoLocalDTO[]) => {
//         this.TreeDataOrgaosLocais = this.formatarDadosParaTreeSelect(data);
//       },
//       error: error => {
//         console.error('Erro ao carregar órgãos locais:', error);
//       }
//     });
//   }

//   formatarDadosParaTreeSelect(data: OrgaoLocalDTO[]): any[] {
//     const map = new Map<number, any>();
//     data.forEach(orgao => {
//       const node = {
//         key: orgao.id,
//         label: orgao.sigla + " - " + orgao.descricao,
//         data: orgao.id,
//         children: []
//       };
//       map.set(orgao.id, node);

//       if (this.id && orgao.id == this.veiculo.orgaoLotacao) {
//         this.formulario.get('orgaoLotacao').setValue(node);
//       }

//       if (orgao.orgaoLocalPai !== null && map.has(orgao.orgaoLocalPai)) {
//         map.get(orgao.orgaoLocalPai).children.push(node);
//       }
//     });
//     return Array.from(map.values()).filter(node => node.key !== null);
//   }

//   onLotacaoChange(id: any): void {
//     this.formulario.get('orgaoSublotacao')?.setValue(null);
//     this.TreeDatasubOrgaosLocais = [];
//     this.orgaoLocalService.obterSublotacao(id).subscribe({
//       next: (data: OrgaoLocalFilhoDTO[]) => {
//         this.TreeDatasubOrgaosLocais = this.formatarDadosParaSubLotacaoTreeSelect(data);
//       },
//       error: error => {
//         console.error('Erro ao carregar órgãos locais:', error);
//       }
//     });
//   }

//   formatarDadosParaSubLotacaoTreeSelect(data: OrgaoLocalFilhoDTO[]): any[] {
//     const map = new Map<number, any>();
//     data.forEach(orgao => {
//       const node = {
//         key: orgao.id,
//         label: orgao.sigla + " - " + orgao.descricao,
//         data: orgao.id,
//         children: []
//       };
//       map.set(orgao.id, node);

//       if (this.id && orgao.id == this.veiculo.orgaoSublotacao)
//         this.formulario.get('orgaoSublotacao').setValue(node);
//       if (orgao.orgaoLocalPai !== null && map.has(orgao.orgaoLocalPai)) {
//         map.get(orgao.orgaoLocalPai).children.push(node);
//       }
//     });
//     return Array.from(map.values()).filter(node => node.key !== null);
//   }

//   resetForm(): void {
//     this.formulario.reset();
//     this.formulario.get('placa')?.setValue('');
//     this.formulario.get('placa')?.markAsUntouched();
//     this.veiculo = undefined;
//     this.formulario.controls['placa'].enable();
//     this.isSaving = false;
//     this.formulario.get('placa')?.setValue(null);
//     this.formulario.get('placa')?.markAsUntouched();
//   }

// }