import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GoogleBooksService } from '../services/google-books.service';
import { AvaliacaoModalComponent } from '../avaliacao-modal/avaliacao-modal.component';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';  
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AvaliacaoService } from '../services/avaliacao.service';

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
  resenhaConfirmada: boolean = false;

  constructor(
    private googleBooksService: GoogleBooksService,
    private modalController: ModalController,
    private authService: AuthService,  
    private firestore: AngularFirestore, 
    private avaliacaoService: AvaliacaoService
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

  async verificarResenhaExistente(livroId: string, usuarioId: string): Promise<boolean> {
    const resenhaRef = this.firestore.collection('avaliacoes', ref =>
      ref.where('livroId', '==', livroId).where('usuarioId', '==', usuarioId)
    ).get();

    const snapshot = await resenhaRef.toPromise();
    return snapshot ? !snapshot.empty : false; 
  }

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      
      this.resenhaConfirmada = await this.avaliacaoService.verificarResenhaExistente(user.uid, this.livro.id);
    }
    this.carregarLivrosDaMesmaAutora();
  }

  
  async abrirModal() {
 
    if (this.resenhaConfirmada) {
      return;  
    }

    const modal = await this.modalController.create({
      component: AvaliacaoModalComponent,
      componentProps: {
        livro: this.livro, 
      },
    });

    
    modal.onDidDismiss().then((data) => {
      if (data.data?.resenhaConfirmada) {
        this.resenhaConfirmada = true; 
      }
    });

    await modal.present();
  }
}
