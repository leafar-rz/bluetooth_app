import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
//importamos el router
import { Router } from '@angular/router';
//importamos las alertas
import { AlertController } from '@ionic/angular';

//firebase
import { AngularFireAuth } from '@angular/fire/compat/auth';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {


    // se agrego el FormGroup
    id : any;
    formReg: FormGroup;
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
      //Instancia de firebase
      private afAuth: AngularFireAuth
    ) 
    //validacion del metodo para que si se logie
    {
      this.formReg = this.formBuilder.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
      });
    }
  
    ngOnInit() {
    }
  
    ionViewWillEnter() {
      this.formReg.reset();
    }
  
    async register() {
      if (this.formReg.valid) {
        const name = this.formReg.get('name')?.value;
        const email = this.formReg.get('email')?.value;
        const password = this.formReg.get('password')?.value;
    
        try {
          const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
    
          // El usuario ha sido registrado con éxito
          const user = userCredential.user;
    
          const alert = await this.alertController.create({
            header: 'Registro exitoso',
            message: `¡Bienvenido, ${name}!`,
            buttons: ['OK']
          });
    
          await alert.present();
    
          this.router.navigate(['home']);
        } catch (error:any) {
          console.error(error);
    
          // Manejar errores específicos de Firebase
          if (error.code === 'auth/email-already-in-use') {
            this.showAlert('Error', 'Este correo electrónico ya está registrado. Por favor, inicia sesión.');
          } else {
            this.showAlert('Error', 'Ocurrió un error durante el registro. Por favor, inténtalo de nuevo.');
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