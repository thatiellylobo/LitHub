import { Component, OnInit } from '@angular/core';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';
import { Keyboard } from '@capacitor/keyboard';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; 

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage {
  emailOuUsuario: string = ''; 
  senha: string = '';

  constructor(
    private screenOrientation: ScreenOrientation,
    private router: Router,
    private authService: AuthService 
  ) {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT)
      .then(() => console.log('Tela travada em retrato'))
      .catch((error) => console.log('Erro ao travar a orientação: ', error));
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

  async fazerLogin() {
    try {
      const usuario = await this.authService.login(this.emailOuUsuario, this.senha);
      if (usuario) {
        this.router.navigate(['/tabs/home']); 
      }
    } catch (error) {
      console.error('Erro ao fazer login: ', error);
    }
  }
}
