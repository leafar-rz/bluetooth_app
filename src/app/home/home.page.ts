import { Component } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { response } from 'express';
import { AlertController, NavController, ToastController } from '@ionic/angular';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  pairedList: PairedDevice[] | undefined;
  listToggle: boolean = false;
  pairedDeviceId: number = 0;
  dataSend = "";
  isConnected: boolean = false;
  receivedData: string = '0';
  readInterval: any;
  priceArticle: number = 0;
  selectedCategory: string = '';
  visible: boolean =false;
  selectedItem: any;
showSelectedItem: boolean = false;
calculatedProducts: any[] = [];
selectedProductIndex: number | null = null;


  articulos=
{
  "categorias": [
    {
      "id": 1,
      "nombre": "Frutas",
      "articulos": [
        {
          "id": 1,
          "descripcion": "Manzanas",
          "precio": 50,
          "img": "https://media.istockphoto.com/id/184276818/es/foto/manzana-red.jpg?s=612x612&w=0&k=20&c=BFD8ixD7eyXMm3aSVIdz1hUsLG-lX8Ig2HBr6IVJuzU="
        },
        {
          "id": 2,
          "descripcion": "Plátanos",
          "precio": 30,
          "img": "https://www.shutterstock.com/image-photo/bunch-bananas-isolated-on-white-260nw-1722111529.jpg"
        },
        {
          "id": 3,
          "descripcion": "Fresas",
          "precio": 40,
          "img": "https://media.istockphoto.com/id/1412854156/es/foto/fresas-aisladas-fresa-entera-y-media-sobre-fondo-blanco-rodaja-de-fresa-con-trazado-de-recorte.jpg?s=612x612&w=0&k=20&c=pjxh7kbYhG6gv_liOdHmP8APxPoaXrLBg2A7GgGAMWE="
        },
        {
          "id": 4,
          "descripcion": "Uvas",
          "precio": 80,
          "img": "https://media.istockphoto.com/id/803721418/es/foto/uva-uva-oscuro-uvas-con-hojas-aisladas-con-trazado-de-recorte-profundidad-de-campo.jpg?s=612x612&w=0&k=20&c=KzDmSehsvUbOCDBXeU_REfP3etlYmNu1CuxBdzLC9q4="
        }
      ]
    },
    {
      "id": 2,
      "nombre": "Verduras",
      "articulos": [
        {
          "id": 6,
          "descripcion": "Zanahorias",
          "precio": 15,
          "img": "https://media.istockphoto.com/id/619252960/es/foto/zanahoria.jpg?s=612x612&w=0&k=20&c=6nyc7qMu3zlrYnT2y2M5cY3PUDko4A4GHp7DZoGdqwo="
        },
        {
          "id": 7,
          "descripcion": "Tomates",
          "precio": 40,
          "img": "https://img.freepik.com/foto-gratis/tomates_144627-15413.jpg"
        },
        {
          "id": 8,
          "descripcion": "Espinacas",
          "precio": 30,
          "img": "https://www.gob.mx/cms/uploads/article/main_image/80254/espinaca.jpg"
        },
        {
          "id": 9,
          "descripcion": "Pimientos",
          "precio": 20,
          "img": "https://media.istockphoto.com/id/153564958/es/foto/coloridos-pimientos.jpg?s=612x612&w=0&k=20&c=E_y3l8tJ_MOmYitgOxWiv51k7R2Rw8YXVCBExawfIPg="
        }
      ]
    }
  ]
}


  constructor(public navCtrl: NavController, private alertCtrl: AlertController, private bluetoothSerial: BluetoothSerial, private toastCtrl: ToastController) {
      this.checkBluetoothEnable();
  }

  checkBluetoothEnable() {
      this.bluetoothSerial.isEnabled().then(success => {
          this.listPairedDevices();
      }, error => {
          this.showError("Por favor, activa el Bluetooth");
      });
  }

  listPairedDevices() {
    this.bluetoothSerial.list().then(success => {
        this.pairedList = success;
        this.listToggle = true;
      // Inicia la lectura continua al obtener la lista de dispositivos emparejados
        this.startReadingBluetoothData();
    }, error => {
        this.showError("Ha sucedido un error al recuperar la lista, inténtalo de nuevo");
        this.listToggle = false;
    });
}

  selectDevice(index: number) {
    if (this.pairedList && this.pairedList.length > index) {
      let connectedDevice = this.pairedList[index];
      if (connectedDevice && connectedDevice.address) {
        let address = connectedDevice.address;
        this.connect(address);
      } else {
        this.showError("Dispositivo seleccionado no válido");
      }
    } else {
      this.showError("Índice de dispositivo no válido");
    }
  }

  connect(address: any) {
      this.bluetoothSerial.connect(address).subscribe(success => {
          this.deviceConnected();
          this.showToast("Conectado correctamente");
      }, error => {
          this.showError("No se ha podido conectar, algo ha fallado.");
      });
  }

  deviceConnected() {
    this.isConnected = true;
    this.bluetoothSerial.subscribe("\n").subscribe(success => {
        this.handleData(success);
        this.showToast("Conectado correctamente");
    }, error => {
        this.showError(error);
    });
  }

  handleData(data: any) {
    // Se reemplaza el valor anterior con el nuevo dato recibido
    this.receivedData = data.trim();
  
    // NUEVO: Puedes dividir los datos si es necesario
    let dataArray = this.receivedData.split(' ');
    // NUEVO: Usa dataArray según sea necesario
  
    // Actualiza el ion-input con los datos recibidos
    // this.showToast(data);
  }
  

  deviceDisconnect() {
    this.bluetoothSerial.disconnect();
    this.showToast("Se ha desconectado del dispositivo");
    this.isConnected = false;
  }

  sendData(dataToSend: string) {
      this.dataSend = "\n";
      this.dataSend += dataToSend;

      this.bluetoothSerial.write("5").then(success => {
          this.showToast(success);
      }, error => {
          this.showError(error);
      });
  }

 // Dentro de la clase HomePage
async calculatePrice() {
  let calculatePay = parseFloat(this.receivedData) * this.priceArticle;

  // Agregar el producto calculado a la lista
  this.calculatedProducts.push({
    item: this.selectedItem,
    peso: parseFloat(this.receivedData),
    total: calculatePay
  });

  const alert = await this.alertCtrl.create({
    header: 'Informacion',
    message: `El total a pagar es de: $${calculatePay}`,
    buttons: ['OK']
  });
  await alert.present();

  this.selectedItem = null;
  this.showSelectedItem = false;
}

cancelAdd(){
  this.selectedItem = null;
  this.showSelectedItem = false;
}

  async showError(message: string) {
    const alert = await this.alertCtrl.create({
        header: '¡Error!',
        message: message,
        buttons: ['dismiss']
    });
    await alert.present();
}

  async showToast(message: string) {
      let toast = await this.toastCtrl.create({
          message: message,
          duration: 5000
      });
      await toast.present();
  }

  // NUEVO método para leer datos del Bluetooth de manera continua
  startReadingBluetoothData() {
    this.readInterval = setInterval(() => {
      this.readBluetoothData();
    }, 2000); // Ajusta el intervalo según tus necesidades
  }

  // Método para leer datos del Bluetooth
  readBluetoothData() {
    this.bluetoothSerial.read().then(
      (data) => {
        if (data.length > 0) {
          this.handleData(data);
        }
      },
      (error) => {
        this.showError('Error al leer datos del Bluetooth: ' + error);
      }
    );
  }

  // Método para detener la lectura continua cuando sea necesario
  stopReadingBluetoothData() {
    clearInterval(this.readInterval);
  }

  ngOnDestroy() {
    this.stopReadingBluetoothData();
  }


async selectedArticle(articulo: any) {
  this.priceArticle = parseFloat(articulo.precio);
  this.selectedItem = articulo;
  this.showSelectedItem = true;
  const alert = await this.alertCtrl.create({
    header: 'Informacion',
    message: `Articulo seleccionado`,
    buttons: ['OK']
  });
  await alert.present();
  this.visible = false;
}


// Dentro de la clase HomePage
showProducts(tipo: string) {
  this.selectedCategory = tipo;
  this.visible=true;
  
}

// Dentro de la clase HomePage
getTotalSum(): number {
  return this.calculatedProducts.reduce((sum, product) => sum + product.total, 0);
}

removeProduct(): void {
  if (this.selectedProductIndex !== null) {
    this.calculatedProducts.splice(this.selectedProductIndex, 1);
    this.selectedProductIndex = null;
  }
}

}





interface PairedDevice {
  class: number;
  id: string;
  address: string;
  name: string;
}

