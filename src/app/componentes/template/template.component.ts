import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from 'src/app/auth.service';


@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css'],
  providers: [DialogService] // Certifique-se de fornecer o serviço aqui
})
export class TemplateComponent implements OnInit, OnDestroy {
  isSmallScreen = false;
  menuAberto: boolean = false;
  menus: MenuItem[] = [];
  ref?: DynamicDialogRef;
  userInitial: string = ''; // Armazena a inicial do usuário
  options: FormGroup;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private formBuilder: FormBuilder,
    public dialogService: DialogService,
    private router: Router,
    private messageService: MessageService,
    public authService: AuthService,

  ) {
    this.options = this.formBuilder.group({
      bottom: 0,
      fixed: false,
      top: 0
    });
  }

  ngOnInit(): void {
    this.renderizaMenu();
    this.observeScreenSize();
  }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.close();
    }
  }

  /**
   * Renderiza o menu lateral com itens e subitens.
   */
  renderizaMenu(): void {
    this.menus = [
      {
        label: 'Consultas',
        icon: 'fa fa-search',
        routerLink: '/cliente-consultar-novo',
        command: () => this.toggleMenu()
      },
      {
        label: 'Clientes',
        icon: 'fa fa-user',
        routerLink: '/cliente-listar',
        command: () => this.toggleMenu()
      },
      {
        label: 'Financeiro',
        icon: 'fa fa-money-bill',
        routerLink: '/financeiro',
        command: () => this.toggleMenu()
      },

      {
        label: 'Usuarios',
        icon: 'fa fa-user-shield',
        routerLink: '/usuario-listar',
        command: () => this.toggleMenu()
      },
      {
        label: 'Despesas',
        icon: 'fa fa-money-bill-wave',
        routerLink: '/despesas-listar',
        command: () => this.toggleMenu()
      },
    ];
  }

  /**
   * Alterna o estado do menu (aberto ou fechado).
   */
  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  /**
   * Observa mudanças no tamanho da tela para ajustar o comportamento do menu.
   */
  observeScreenSize(): void {
    this.breakpointObserver
      .observe(['(max-width:1400px)'])
      .subscribe(res => (this.isSmallScreen = res.matches));
  }

  /**
   * Define o modo da sidenav com base no tamanho da tela.
   */
  get sidenavMode(): string {
    return this.isSmallScreen ? 'over' : 'side';
  }



  
  estaLogado(): boolean {
    return this.authService.isAuthenticated();
  }
  
  logout(): void {
    this.authService.logout();
    this.messageService.add({
      severity: 'info',
      summary: 'Logout',
      detail: 'Você saiu do sistema.'
    });
    this.router.navigate(['/login']);
  }
  

  mostrarToolbar(): boolean {
    // oculta a barra quando estiver na página de login
    return !this.router.url.includes('/login');
  }


  /**
   * Abre um diálogo (exemplo, se necessário).
   */
  // openUserModal(): void {
  //   this.ref = this.dialogService.open(SomeDialogComponent, {
  //     width: '20%',
  //     contentStyle: { overflow: 'visible' },
  //     baseZIndex: 10000
  //   });
  // }
}

