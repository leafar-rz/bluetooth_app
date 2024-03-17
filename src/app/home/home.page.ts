import { Component } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { response } from 'express';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { jsPDF } from 'jspdf';


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

 /*  sendData(dataToSend: string) {
      this.dataSend = "\n";
      this.dataSend += dataToSend;

      this.bluetoothSerial.write("5").then(success => {
          this.showToast(success);
      }, error => {
          this.showError(error);
      });
  } */

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
  return this.calculatedProducts.reduce((sum, product) => sum + product.total, 0).toFixed(3);
}

removeProduct(): void {
  if (this.selectedProductIndex !== null) {
    this.calculatedProducts.splice(this.selectedProductIndex, 1);
    this.selectedProductIndex = null;
  }
}

imprimirWifi() {
   const pdfDoc = this.generatePDF();
   pdfDoc.autoPrint();
   pdfDoc.output('dataurlnewwindow');
 
   /*const pdfDoc = this.generatePDF();
   pdfDoc.autoPrint();
   
   // Obtener el PDF como un blob
   const pdfBlob = pdfDoc.output('blob');
   
   // Crear una URL objeto para el blob
   const blobUrl = URL.createObjectURL(pdfBlob);
   
   // Abrir el PDF en una nueva pestaña
   window.open(blobUrl, '_system', 'location=yes');*/
 
   /*
   const pdfDoc = this.generatePDF();
   pdfDoc.autoPrint();
   
   // Obtener el PDF como un blob
   const pdfBlob = pdfDoc.output('blob');
   
   // Crear una URL objeto para el blob
   const blobUrl = URL.createObjectURL(pdfBlob);
   
   // Abrir el PDF en una nueva pestaña
   window.open(blobUrl, '_system', 'location=yes');
 
   alert("LLegamos al final");
   console.log("LLegamos al final");*/
 
   /*const contenidoHtml = '<h1>Título del documento</h1><p>Contenido del documento</p>';
   
    const options: PrintOptions = {
     name: 'Mi documento',
     duplex: true,
   landscape: true,
     grayscale: true
   }; 
   
   
   this.printer.print(contenidoHtml, options).then(
     () => {
       alert('Impresión exitosa');
     },
     error => {
       alert('Error al imprimir:'+ error);
     }
   );*/
 
 }

generatePDF() {
  const ticketWidth = 80; // Ancho del ticket en milímetros (8 cm)
  const ticketHeight = 300; // Altura del ticket en milímetros (puedes ajustar según tus necesidades)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [ticketWidth, ticketHeight]
  });

  // Agregar el logo
  const logoImg = new Image();
  logoImg.src = 'assets/img/ESMERALDA_LOGO.png';
  const logoWidth = 60;
  const logoHeight = 20;
  const logoX = (ticketWidth - logoWidth) / 2;
  const logoY = 10;
  doc.addImage(logoImg, 'PNG', logoX, logoY, logoWidth, logoHeight);

  // Agregar los detalles de los productos
  let y = logoY + logoHeight + 10;
  this.calculatedProducts.forEach(product => {
    doc.setFontSize(10);
    doc.text('-------------------------------------', 10, y);
    y += 5;
    doc.text(`${product.item.descripcion} $${product.item.precio} x ${product.peso} Kg`, 10, y);
    y += 5;
    doc.text(`Subtotal= $${product.total.toFixed(3)}`, 10, y);
    y += 5;
  });

  // Agregar el total a pagar
  doc.setFontSize(12);
  y += 5;
  doc.text('_______________________________________', 10, y);
  y += 5;
  doc.text(`|Total a pagar: $${this.getTotalSum()}`, 10, y);
  y += 1;
  doc.text('_______________________________________', 10, y);

  return doc;
}

imprimirBluetooth() {
  // Verificar si el dispositivo Bluetooth está disponible
  this.bluetoothSerial.isEnabled().then(() => {
    // Obtener la lista de dispositivos emparejados
    this.bluetoothSerial.list().then((devices: any[]) => {
      // Crear una lista de dispositivos para mostrar al usuario
      const deviceList = devices.map(device => ({
        name: device.name,
        address: device.address
      }));

      // Mostrar un cuadro de diálogo con la lista de dispositivos
      this.showDeviceListDialog(deviceList);
    });
  }).catch((error) => {
    alert('Bluetooth no está disponible:'+ error);
  });
}

async showDeviceListDialog(deviceList: any[]) {
  const alert = await this.alertCtrl.create({
    header: 'Seleccionar dispositivo',
    inputs: deviceList.map(device => ({
      name: device.address,
      type: 'radio',
      label: device.name,
      value: device.address
    })),
    buttons: [
      {
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: 'Conectar',
        handler: (selectedAddress) => {
          this.connectToDevice(selectedAddress);
        }
      }
    ]
  });

  await alert.present();
}

connectToDevice(address: string) {
  // Conectar con la impresora Bluetooth
  this.bluetoothSerial.connect(address).subscribe(
    () => {
      alert('Conectado a la impresora Bluetooth');

      // Generar el contenido del ticket
      const ticketContent = this.getTicketContent();

      // Enviar los datos del ticket a la impresora
      this.bluetoothSerial.write(ticketContent).then(
        () => {
          alert('Datos del ticket enviados a la impresora');

          // Desconectar de la impresora Bluetooth
          this.bluetoothSerial.disconnect().then(() => {
            alert('Desconectado de la impresora Bluetooth');
            // Volver a llamar a listPairedDevices() para seguir recibiendo datos
            this.listPairedDevices();
          });
        },
        (error) => {
          alert('Error al enviar los datos del ticket:'+ error);
        }
      );
    },
    (error) => {
      alert('Error al conectar con la impresora Bluetooth:'+ error);
    }
  );
}

getTicketContent() {
  let ticketContent = '';

  // Agregar el título
  ticketContent += 'Joyeria Esmeralda\n\n';

  // Agregar los detalles de los productos
  this.calculatedProducts.forEach(product => {
    ticketContent += `${product.item.descripcion} $${product.item.precio} x ${product.peso} Kg\n`;
    ticketContent += `Subtotal= $${product.total.toFixed(3)}\n`;
    ticketContent += '-------------------------------------\n';
  });

  // Agregar el total a pagar
  ticketContent += '_______________________________________\n';
  ticketContent += `|Total a pagar: $${this.getTotalSum()}\n`;
  ticketContent += '_______________________________________\n';

  return ticketContent;
}

}


interface PairedDevice {
  class: number;
  id: string;
  address: string;
  name: string;
}

