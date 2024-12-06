import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { SolicitacaoServicoListarComponent } from '../solicitacao-servico-listar/solicitacao-servico-listar.component';
import { ModalService } from './modal.service';
import { Subscription } from 'rxjs';
import { TreeSelectModule } from 'primeng/treeselect';
import { tipoManutencaoEnumDescricao } from 'src/app/core/enums/tipoManutencaoEnum';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SolicitacaoServicoService } from '../solicitacao-servico.service';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SolicitacaoServicoCompletaDTO } from '../solicitacao-detalhes-vistoria/solicitacao-detalhes-vistoria.model';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-solicitacao-servico-editar',
  standalone: true,
  imports: [CommonModule, InputTextareaModule, TreeSelectModule, ButtonModule, SolicitacaoServicoListarComponent, DialogModule, ReactiveFormsModule],
  templateUrl: './solicitacao-servico-editar.component.html',
  styleUrl: './solicitacao-servico-editar.component.css'
})
export class SolicitacaoServicoEditarComponent {
  @Input() displayModal: boolean = false;
  @Input() id: any;

  formulario: FormGroup;
  private subscription: Subscription;
  treeDataTipoManutencao: any[] = [];
  solicitacaoId?: number;
  disableSaveButton: boolean = true;
  solicitacaoSelecionada: SolicitacaoServicoCompletaDTO = {};

  constructor(public solicitacaoServicoService: SolicitacaoServicoService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private fb: FormBuilder, private modalService: ModalService) {
    this.formulario = this.fb.group({
      tipoManutencao: [''],
      servicos: [''],
    });
  }

  ngOnInit() {
    this.carregarTipoManutencao();
    if (!this.id && this.route.snapshot.params["id"]) {
      this.id = this.route.snapshot.params["id"];
    }
    if (this.id)
      this.solicitacaoServicoService.buscarPorId(this.id).subscribe(
        (res: SolicitacaoServicoCompletaDTO) => {
          this.solicitacaoSelecionada = res;
          this.formulario.get('tipoManutencao').setValue(this.getTipoManutencao(res.tipoManutencao));
          this.formulario.get('servicos').setValue(res.descricaoSolicitacao);
        }
      );

    this.formulario.valueChanges.subscribe(() => {
      this.disableSaveButton = !this.formulario.dirty || !this.formulario.valid;
    });

    this.subscription = this.modalService.displayModal$.subscribe(
      (show: boolean) => (this.displayModal = show)
    );
  }

  editarServico() {
    this.disableSaveButton = true;
    this.solicitacaoSelecionada
    if (this.formulario.valid) {
      const tipoManutencaoValue = this.formulario.get('tipoManutencao').value;
      const servicos = this.formulario.get('servicos').value;
      const payload = {
        tipoManutencao: tipoManutencaoValue ? tipoManutencaoValue.key : null,
        descricaoSolicitacao: servicos
      };

      this.solicitacaoServicoService.editarSolicitacaoServico(this.id, payload)
        .subscribe({
          next: (response) => {
            console.log("Alterações salvas com sucesso:", response);
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Vistoria editada e dados registrados com sucesso.',
              life: 3000
            });

            this.modalService.fecharModal();
            this.formulario.markAsPristine(); 
          },
          error: (error) => {
           console.error("Erro ao salvar alterações:", error);
          }
        });
    } else {
      console.log("Formulário inválido");
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, preencha todos os campos obrigatórios.',
        life: 3000
      });
    }
  }

  closeModal() {
    this.modalService.fecharModal();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  getTipoManutencao(tipoId) {

    let tipoList = null;
    tipoManutencaoEnumDescricao.find(item => {
      if (item.value == tipoId)
        tipoList = {
          label: item.label,
          data: item,
          key: item.value
        };
    });
    return tipoList;
  }

  carregarTipoManutencao() {
    tipoManutencaoEnumDescricao.find(item => {
      this.treeDataTipoManutencao.push({
        label: item.label,
        data: item,
        key: item.value
      });
    });
  }

  buscarEdicaoPorId(id: number): void {
    this.solicitacaoServicoService.buscarPorId(id).subscribe({
      next: (data) => {
        if (data) {
          console.log(data);
        } else {
          console.error('Dados da solicitação não encontrados');
        }
      },
      error: (err) => {
        console.error('Erro ao buscar os detalhes da solicitação:', err);
      }
    });
  }

  getSituacaoDescricao(situacao: number): string {
    switch (situacao) {
      case 1: return 'Vigente';
      case 2: return 'Encerrado';
      default: return 'Situação desconhecida';
    }
  }

  getDescricaoTipoManutencao(tipo: string): string {
    const descricao = tipoManutencaoEnumDescricao.find(item => item.value === tipo);
    return descricao ? descricao.label : 'Tipo desconhecido';
  }
}
