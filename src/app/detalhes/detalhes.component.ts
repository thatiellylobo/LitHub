import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GoogleBooksService } from '../services/google-books.service';
import { AvaliacaoModalComponent } from '../avaliacao-modal/avaliacao-modal.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss'],
})
export class DetalhesComponent {
  @Input() livro: any;
  @Output() voltarParaLista = new EventEmitter<void>();
  sinopseExpandida: boolean = false;
  livrosDaMesmaAutora: any[] = [];

  constructor(
    private googleBooksService: GoogleBooksService,
    private modalController: ModalController
  ) {}

  voltar() {
    this.voltarParaLista.emit();
  }

  toggleSinopse() {
    this.sinopseExpandida = !this.sinopseExpandida;
  }

  getSinopseTruncada(): string {
    const sinopse = this.livro.volumeInfo.description || 'Sinopse não disponível';
    const frases = sinopse.split('. ');
    return frases.slice(0, 2).join('. ') + (frases.length > 2 ? '...' : '');
  }

  carregarLivrosDaMesmaAutora() {
    const autor = this.livro.volumeInfo.authors[0];
    this.googleBooksService.getLivrosPorAutor(autor).subscribe(
      (livros) => {
        this.livrosDaMesmaAutora = livros;
      },
      (error) => {
        console.error('Erro ao carregar livros da mesma autora:', error);
        this.livrosDaMesmaAutora = [];
      }
    );
  }

  async abrirModal() {
    const modal = await this.modalController.create({
      component: AvaliacaoModalComponent,
      componentProps: {
        livro: this.livro 
      }
    });
    return await modal.present();
  }

  ngOnInit() {
    this.carregarLivrosDaMesmaAutora();
  }
}
