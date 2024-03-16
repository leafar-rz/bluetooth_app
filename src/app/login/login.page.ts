import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
//importamos el router
import { Router } from '@angular/router';
//importamos las alertas
import { AlertController } from '@ionic/angular';

//firebase
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

    // se agrego el FormGroup
    id : any;
    LoginForm: FormGroup;
    //Declaramos estas dos variables para saber que usuario esta actualmente corriendo
    user: any;
    id_user: any;
  
    constructor
    (
      //objeto del router
      private router: Router,
      //importacion del form builder
      private formBuilder: FormBuilder,
      //Objeto para usar alertas con el AlertController
      private alertController: AlertController,
      private afAuth: AngularFireAuth
    ) 
    //validacion del metodo para que si se logie
    {
      this.LoginForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
      });
    }
  
    ngOnInit() {
    }
  
    ionViewWillEnter() {
      this.LoginForm.reset();
    }
  
    async login() {
      if (this.LoginForm.valid) {
        console.log(this.LoginForm.get('email')?.value, this.LoginForm.get('password')?.value);
    
        try {
          const userCredential = await this.afAuth.signInWithEmailAndPassword(
            this.LoginForm.get('email')?.value,
            this.LoginForm.get('password')?.value
          );
        
          // Verifica si la autenticación fue exitosa
          if (userCredential.user) {
            const alert = await this.alertController.create({
              header: 'LogIn exitoso',
              message: `Bienvenido`,
              buttons: ['OK']
            });
            // Ejecutamos la alerta
            await alert.present();
        
            this.router.navigate(['home']);
          }
        } catch (error: any) {
          if (error.code === 'auth/invalid-email') {
            this.showAlert('Error', 'Correo electrónico no válido. Verifica tu correo e inténtalo de nuevo.');
          } else if (error.code === 'auth/invalid-credential') {
            this.showAlert('Error', 'Credencial no válida. Verifica tu correo o regístrate.');
          } else if (error.code === 'auth/wrong-password') {
            this.showAlert('Error', 'Contraseña incorrecta. Verifica tu contraseña e inténtalo de nuevo.');
          } else if (error.code === 'auth/user-not-found') {
            this.showAlert('Error', 'Usuario no encontrado. Verifica tu correo o regístrate.');
          } else {
            this.showAlert('Error', 'Ocurrió un error durante el inicio de sesión. Por favor, inténtalo de nuevo.');
          }
        }
      } else {
        this.showAlert('Error', 'Formulario inválido');
      }
    }

    
async showAlert(header: string, message: string) {
  const alert = await this.alertController.create({
    header,
    message,
    buttons: ['OK']
  });

  await alert.present();
}



}