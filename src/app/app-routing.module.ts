import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IndexComponent } from './index/index.component';
import { ClienteConsultarNovoComponent } from './pages/cliente/cliente-consultar-novo/cliente-consultar-novo.component';
import { ClienteListarComponent } from './pages/cliente/cliente-listar/cliente-listar.component';
import { ClienteCriarNovoComponent } from './pages/cliente/cliente-criar-novo/cliente-criar-novo.component';



const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: IndexComponent },

      { path: 'cliente-consultar-novo', component: ClienteConsultarNovoComponent },

      { path: 'cliente-criar-novo', component: ClienteCriarNovoComponent },
      
      { path: 'cliente-criar-novo/:id', component: ClienteCriarNovoComponent },
      
      { path: 'cliente-listar', component: ClienteListarComponent },



    ],

  },
  { path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
