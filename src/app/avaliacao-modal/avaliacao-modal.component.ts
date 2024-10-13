import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AvaliacaoService } from '../services/avaliacao.service';

@Component({
  selector: 'app-avaliacao-modal',
  templateUrl: './avaliacao-modal.component.html',
  styleUrls: ['./avaliacao-modal.component.scss'],
})
export class AvaliacaoModalComponent {
  nota: number = 0;
  resenha: string = '';
  livro: any; 

  constructor(
    private modalController: ModalController,
    private avaliacaoService: AvaliacaoService
  ) {}

  fecharModal() {
    this.modalController.dismiss();
  }

  setNota(nota: number) {
    if (this.nota === nota) {
      this.nota = nota - 0.5;
    } else if (this.nota === nota - 0.5) {
      this.nota = 0;
    } else {
      this.nota = nota;
    }
  }

  confirmarAvaliacao() {
    this.avaliacaoService.adicionarAvaliacao({
      livro: this.livro,
      nota: this.nota,
      resenha: this.resenha,
    });
    this.fecharModal();
  }
}
