import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { IndexComponent } from './index/index.component';
import { ClienteConsultarNovoComponent } from './pages/cliente/cliente-consultar-novo/cliente-consultar-novo.component';
import { ClienteListarComponent } from './pages/cliente/cliente-listar/cliente-listar.component';



const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: IndexComponent },

      { path: 'cliente-consultar-novo', component: ClienteConsultarNovoComponent },

    ],

  },
  { path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
