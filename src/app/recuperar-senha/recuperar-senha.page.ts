import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-recuperar-senha',
  templateUrl: './recuperar-senha.page.html',
  styleUrls: ['./recuperar-senha.page.scss'],
})
export class RecuperarSenhaPage {
  email: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private toastController: ToastController) {}

  async recuperarSenha() {
    if (!this.email) {
      this.presentToast('Preencha o campo de e-mail.', 'error');
      return;
    }
    this.isLoading = true; 
    
    try {
      await this.authService.recuperarSenha(this.email);
      this.presentToast('E-mail de recuperação enviado com sucesso!', 'success'); 
    } catch (error) {
      console.error('Erro ao enviar o e-mail de recuperação: ', error);
      this.presentToast('E-mail incorreto ou não cadastrado.', 'error'); 
    } finally {
      this.isLoading = false; 
    }
  }

  async presentToast(message: string, type: 'success' | 'error') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: type === 'success' ? 'success' : 'danger' 
    });
    toast.present();
  }}