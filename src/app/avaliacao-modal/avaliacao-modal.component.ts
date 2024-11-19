import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AvaliacaoService } from '../services/avaliacao.service';
import { AuthService } from '../services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { timestamp } from 'rxjs';


@Component({
  selector: 'app-avaliacao-modal',
  templateUrl: './avaliacao-modal.component.html',
  styleUrls: ['./avaliacao-modal.component.scss'],
})
export class AvaliacaoModalComponent {
  nota: number = 0;
  resenha: string = '';
  @Input() livro: any; 

  constructor(
    private modalController: ModalController,
    private avaliacaoService: AvaliacaoService,
    private authService: AuthService,
    private firestore: AngularFirestore,
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
    this.authService.getCurrentUser().then(user => {
      if (user) {
        const reviewData = {
          userId: user.uid, 
          bookId: this.livro.id,
          rating: this.nota,
          reviewText: this.resenha,
          timestamp: new Date(),
          livro: this.livro,
        };
        this.avaliacaoService.adicionarAvaliacao(reviewData);
        this.fecharModal();
      } else {
        console.error('Usuário não autenticado');
      }
    });
  }

  async marcarComoLido() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      const userRef = this.firestore.collection('users').doc(user.uid);
  
      try {
        const userDoc = await userRef.get().toPromise();

        if (userDoc && userDoc.exists) {
          const userData = userDoc.data() as any;
          const livrosLidosAtualizados = (userData.livrosLidos || 0) + 1;
  
          await userRef.update({
            livrosLidos: livrosLidosAtualizados,
          });
  
          return livrosLidosAtualizados;
        } else {
          console.log('Documento não encontrado');
          return 0; 
        }
      } catch (error) {
        console.error('Erro ao acessar o documento do usuário:', error);
        return 0; 
      }
    }
  }
}