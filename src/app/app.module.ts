// Angular Core Modules
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';

// Angular Routing & HTTP Modules
import { AppRoutingModule } from './app-routing.module';

// Angular Common Modules & Services
import { CommonModule, registerLocaleData } from '@angular/common';

// Application Components & Modules
import { AppComponent } from './app.component';
import { TemplateModule } from './componentes/template/template.module';

// PrimeNG Modules & Services
import { DialogModule } from 'primeng/dialog';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';

// Locale & Utils
import ptBr from '@angular/common/locales/pt';
import { MessageService } from 'primeng/api';
import { BreadcrumbModule } from './componentes/breadcrumb/breadcrumb.module';
import { PrimeNgModule } from './componentes/primeng/primeng.module';
import { KmLMaskDirective } from './core/directives/consumo-directive';
import { DropdownModule } from 'primeng/dropdown';

// Register locale data
registerLocaleData(ptBr);

@NgModule({
  declarations: [
    AppComponent,
    KmLMaskDirective, // Diretivas personalizadas
  ],
  imports: [
    DropdownModule, 
    BrowserModule,
    AppRoutingModule, // Configuração de rotas
    TemplateModule, // Módulo do template
    BreadcrumbModule, // Outros módulos
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    PrimeNgModule,
    ToastModule, // Toast para notificações
    CommonModule,
    CardModule,
    DynamicDialogModule,
    DialogModule,
  ],
  providers: [
    DialogService,
    MessageService, // Serviços do PrimeNG
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
