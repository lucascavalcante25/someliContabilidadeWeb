// modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private displayModalSource = new BehaviorSubject<boolean>(false);
  displayModal$ = this.displayModalSource.asObservable();

  abrirModal() {
    this.displayModalSource.next(true);
  }

  fecharModal() {
    this.displayModalSource.next(false);
    location.reload();
  }
}
