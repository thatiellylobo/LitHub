import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AvaliacaoService } from '../services/avaliacao.service';
import { AuthService } from '../services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-avaliacao-modal',
  templateUrl: './avaliacao-modal.component.html',
  styleUrls: ['./avaliacao-modal.component.scss'],
})
export class AvaliacaoModalComponent {
  nota: number = 0;
  resenha: string = '';
  resenhaConfirmada: boolean = false;
  @Input() livro: any; 
  @Input() avaliacaoExistente: any; 
  botaoTexto: string = 'Enviar Avaliação';   

  constructor(
    private modalController: ModalController,
    private avaliacaoService: AvaliacaoService,
    private authService: AuthService,
    private firestore: AngularFirestore,
  ) {}

  ngOnInit() {
    if (this.avaliacaoExistente) {
      this.botaoTexto = 'Editar';
      this.nota = this.avaliacaoExistente.rating; 
      this.resenha = this.avaliacaoExistente.reviewText; 
    }
  }

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

  async confirmarAvaliacao() {
    const user = await this.authService.getCurrentUser(); // Já pega o usuário autenticado
    if (user) {
      try {
        // Buscando os dados completos do usuário
        const userData = await this.authService.getUserData(user.uid);
        const nomeUsuario = userData?.nome || 'Usuário não encontrado'; 
        
        if (this.avaliacaoExistente) {
          console.log('Atualizando avaliação existente.');
          const resenhaId = this.avaliacaoExistente.id;
          await this.firestore.collection('reviews').doc(resenhaId).update({
            rating: this.nota,
            reviewText: this.resenha,
            nome: nomeUsuario,  
            timestamp: new Date(),
          });
        } else {
          console.log('Criando nova avaliação.');
          const reviewData = {
            userId: user.uid,
            bookId: this.livro.id,
            rating: this.nota,
            reviewText: this.resenha,
            nome: nomeUsuario,  
            timestamp: new Date(),
            livro: this.livro,
            resenhaConfirmada: true,
          };
          await this.avaliacaoService.adicionarAvaliacao(reviewData);
        }
  
        this.modalController.dismiss({
          resenhaConfirmada: true,
        });
      } catch (error) {
        console.error('Erro ao salvar ou atualizar avaliação:', error);
      }
    } else {
      console.error('Usuário não autenticado');
    }
  }
  
  async excluirAvaliacao() {
    if (this.avaliacaoExistente) {
      const resenhaId = this.avaliacaoExistente.id;
      try {
      
        await this.firestore.collection('reviews').doc(resenhaId).delete();
        console.log('Avaliação excluída com sucesso.');
        this.modalController.dismiss({
          resenhaConfirmada: false,
        });
      } catch (error) {
        console.error('Erro ao excluir avaliação:', error);
      }
    }
  }
}
