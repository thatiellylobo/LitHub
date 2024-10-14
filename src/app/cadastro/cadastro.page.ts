import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service'; 
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
})
export class CadastroPage implements OnInit {
  cadastroForm: FormGroup;

  nome: string = '';
  usuario: string = '';
  email: string = '';
  senha: string = '';
  confirmarSenha: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private toastController: ToastController) {
      this.cadastroForm = this.fb.group({
        nome: ['', Validators.required],
        usuario: ['', Validators.required], 
        email: ['', [Validators.required, Validators.email]],
        senha: ['', [Validators.required, Validators.minLength(6)]],
        confirmarSenha: ['', Validators.required]
      }, { validators: this.passwordMatchValidator });
  }
       
  
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): { [key: string]: boolean } | null => {
    const senha = control.get('senha')?.value;
    const confirmarSenha = control.get('confirmarSenha')?.value;
    return senha === confirmarSenha ? null : { mismatch: true }; 
  }
  ngOnInit() {
    console.log(this.cadastroForm);
  }

  async onSubmit() {
    const loading = await this.loadingController.create({
        message: 'Cadastrando...',
        duration: 4000,
        spinner: 'crescent',
        translucent: true,
        cssClass: 'custom-loading',
    });
    await loading.present();

    if (this.cadastroForm.valid) {
        const { email, senha, usuario, nome } = this.cadastroForm.value;
        const trimmedEmail = email.trim(); 

        try {
            await this.authService.register(trimmedEmail, senha, usuario, nome);
            await loading.dismiss();
            this.router.navigate(['/login']);
        } catch (error: any) {
            await loading.dismiss();
            this.presentToast('Erro ao cadastrar: ' + error.message);
        }
    } else {
        await loading.dismiss();
        console.log(this.cadastroForm.errors);
        const senhaControl = this.cadastroForm.get('senha');
        const confirmarSenhaControl = this.cadastroForm.get('confirmarSenha');

        if (confirmarSenhaControl?.hasError('mismatch')) {
            this.presentToast('As senhas não correspondem.');
        } else {
            this.presentToast('Preencha todos os campos obrigatórios corretamente.');
        }
    }
}
  
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000, 
      color: 'danger',
      position: 'top' 
    });
    await toast.present();
  }
}
