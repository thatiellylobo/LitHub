import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'; 

@Component({
  selector: 'app-recuperar-senha',
  templateUrl: './recuperar-senha.page.html',
  styleUrls: ['./recuperar-senha.page.scss'],
})
export class RecuperarSenhaPage {
  email: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router
  ) {}

  async recuperarSenha() {
    if (!this.email) {
      this.presentToast('Preencha o campo de e-mail.', 'error');
      return;
    }

    this.isLoading = true;

    const auth = getAuth();

    try {
      await sendPasswordResetEmail(auth, this.email);


      this.presentToast('Se o e-mail estiver cadastrado, você receberá um link de recuperação.', 'success');

      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Erro ao enviar o e-mail de recuperação:', error);

      if (error.code === 'auth/user-not-found') {
        this.presentToast('E-mail não cadastrado.', 'error');
      } else if (error.code === 'auth/invalid-email') {
        this.presentToast('Formato de e-mail inválido.', 'error');
      } else {
        this.presentToast('Erro ao enviar o e-mail. Tente novamente.', 'error');
      }
    } finally {
      this.isLoading = false;
    }
  }

  async presentToast(message: string, type: 'success' | 'error') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: type === 'success' ? 'success' : 'danger',
    });
    toast.present();
  }
}
