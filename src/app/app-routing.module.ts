import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IndexComponent } from './index/index.component';
import { ClienteCriarNovoComponent } from './pages/cliente/cliente-criar-novo/cliente-criar-novo.component';
import { ClienteListarComponent } from './pages/cliente/cliente-listar/cliente-listar.component';



const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: IndexComponent },

      { path: 'cliente-listar', component: ClienteListarComponent },

      { path: 'cliente-criar-novo', component: ClienteCriarNovoComponent },

      { path: 'cliente-editar/:id', component: ClienteCriarNovoComponent },

      // { path: 'motorista-listar', component: MotoristaListarComponent },

      // { path: 'motorista-criar-novo', component: MotoristaCriarNovoComponent },

      // { path: 'motorista-editar/:id', component: MotoristaCriarNovoComponent },

      // { path: 'equipamento-listar', component: EquipamentoListarComponent },

      // { path: 'equipamento-criar-novo', component: EquipamentoCriarNovoComponent },

      // { path: 'equipamento-editar/:id', component: EquipamentoCriarNovoComponent },

      // { path: 'veiculo-motorista-listar', component: VeiculoMotoristaListarComponent },

      // { path: 'veiculo-motorista-criar', component: VeiculoMotoristaCriarComponent },

      // { path: 'consulta-alocacoes', component: ConsultaAlocacoesComponent },

      // { path: 'consulta-manutencoes', component: ConsultaManutencoesComponent },

      // { path: 'consulta-motorista-afastamento', component: ConsultaMotoristaAfastamentoComponent },

      // { path: 'solicitacao-servico-listar', component: SolicitacaoServicoListarComponent },

      // { path: 'solicitacao-servico-criar', component: SolicitacaoDeServicoCriarComponent },
      
      // { path: 'solicitacao-detalhes-vistoria/:id', component: SolicitacaoDetalhesVistoriaComponent },



    ],

  },
  { path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
