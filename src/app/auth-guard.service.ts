// import { Injectable } from '@angular/core';
// import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
// import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthGuard extends KeycloakAuthGuard {
//   constructor(protected override router: Router, protected override keycloakAngular: KeycloakService) {
//     super(router, keycloakAngular);
//   }
//   isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
//     return new Promise(async (resolve) => {
//       if (!this.authenticated) {
//         this.keycloakAngular.login();
//         resolve(false);
//       }
//       resolve(true);
//     });
//   }
// }