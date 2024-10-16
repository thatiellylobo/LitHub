import { Component, OnInit } from '@angular/core';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { Keyboard } from '@capacitor/keyboard';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; 
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})

export class LoginPage {
  emailOuUsuario: string = ''; 
  senha: string = '';
  passwordType: string = 'password'; 
  passwordIcon: string = 'eye-off';   
  isLoading: boolean = false; 

  constructor(
    private screenOrientation: ScreenOrientation,
    private router: Router,
    private authService: AuthService, 
    private toastController: ToastController 
  ) {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT)
      .then(() => console.log('Tela travada em retrato'))
      .catch((error) => console.log('Erro ao travar a orientação: ', error));
  }

  togglePasswordVisibility() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';    
      this.passwordIcon = 'eye';      
    } else {
      this.passwordType = 'password'; 
      this.passwordIcon = 'eye-off'; 
    }
  }

  ionViewWillEnter() {
    this.emailOuUsuario = '';
    this.senha = '';
  }

  ionViewDidEnter() {
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-is-open');
    });

    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-is-open');
    });
  }

  irParaCadastro() {
    this.router.navigate(['/cadastro']);
  }

  irParaRecuperarSenha() {
    this.router.navigate(['/recuperar-senha']); 
  }

  loginGoogle() {
    this.authService.loginComGoogle();
  }


  async fazerLogin() {
    this.isLoading = true;
  
    try {
      if (!this.emailOuUsuario || !this.senha) {
        this.presentToast('Por favor, preencha todos os campos obrigatórios.');
        return; 
      }
      const usuario = await this.authService.login(this.emailOuUsuario, this.senha);
      if (usuario) {
        this.router.navigate(['/tabs/home']); 
      }
    } catch (error: any) { 
      console.error('Erro ao fazer login: ', error);
      
      if (error && error.code) {
        switch (error.code) {
          default:
            this.presentToast('Credenciais incorretas ou usuário não existe.'); 
            break;
        }
      } else {
       
        this.presentToast('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      this.isLoading = false; 
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      color: 'danger',
      duration: 2000, 
      position: 'top'
    });
    toast.present();
  }
  
  fazerLoginComGoogle() {
    this.authService.loginComGoogle()
      .then(() => {
        console.log('Redirecionamento realizado após login com Google.');
      })
      .catch((error) => {
        console.error('Erro durante o login com Google:', error);
      });
  }

}