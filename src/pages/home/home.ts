import { Component, ViewChild } from '@angular/core';
import {LoadingController, AlertController  } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  private loader;
  private connecting: boolean = false;
  public metaForm: FormGroup;
  public browser;
  public url;
  public ipObject  = {
    ip1: '',
    ip2: '',
    ip3: '',
    ip4: ''
  };

  @ViewChild('ip2') myInput2;
  @ViewChild('ip3') myInput3;
  @ViewChild('ip4') myInput4;

  constructor(private iab: InAppBrowser,
              private loadingCtrl: LoadingController,
              public formBuilder: FormBuilder,
              private alertCtrl: AlertController
  ) {
    this.metaForm = formBuilder.group({
      ip1: ['', Validators.compose([Validators.required, Validators.min(0), Validators.max(255) ])],
      ip2: ['', Validators.compose([Validators.required, Validators.min(0), Validators.max(255) ])],
      ip3: ['', Validators.compose([Validators.required, Validators.min(0), Validators.max(255) ])],
      ip4: ['', Validators.compose([Validators.required, Validators.min(0), Validators.max(255) ])]
    });
  }

  public submitRequest() {
    if (this.metaForm.valid) {
      this.url = `http://${this.ipObject.ip1}.${this.ipObject.ip2}.${this.ipObject.ip3}.${this.ipObject.ip4}`;
      this.connecting = true;
      this.theLoading();
      this.loader.present();
      const options: InAppBrowserOptions = {
        zoom:'no',
        location:'no',
        toolbar:'no',
        hidden:'yes'
      };
      this.browser =  this.iab.create(this.url, '_blank', options);
      this.browser.on('loadstart').subscribe(
        (event) => {
          setTimeout(() => {
            if(this.connecting){
              if(this.loader) {
                this.loader.dismiss();
              }
              this.connecting = false;
              this.presentAlert();
              this.browser.close();
            }
          }, 30000);
        }
      );

      this.browser.on('loadstop').subscribe(
        (event) => {
          if(this.connecting) {
            if (this.loader) {
              this.loader.dismiss();
            }
            this.connecting = false;
            this.browser.show();
          }
          if (event.url === 'http://10.0.1.15/PAGE1.XML' || event.url === 'http://10.0.1.15/page1.xml' || event.url === 'http://10.0.1.15/PAGE21.XML') {
            this.browser.insertCSS({code: "body{background-color: #408080 !important; margin: 0 !important;} table, tbody, td, tr{border: 0 !important;}"});
          }
        },
        (err) => {
          if(this.connecting) {
            if(this.loader) {
              this.loader.dismiss();
            }
            this.connecting = false;
            this.presentAlert();
            this.browser.close();
          }
        }
      );

      this.browser.on("loaderror").subscribe(
        (err) => {
          if (this.connecting) {
            if (this.loader) {
              this.loader.dismiss();
            }
            this.connecting = false;
            this.presentAlert();
            this.browser.close();
          }
        }
      );

      this.metaForm.reset(this.ipObject);
    }
    else {
      alert('something wrong with request');
      this.connecting = false;
    }
  }

  theLoading() {
    this.loader = this.loadingCtrl.create({
      content: 'Connecting to server...',
      duration: 30000
    });
  }

  checkLength(currentOne, nextOne) {
    if (this.ipObject[currentOne].length > 2) {
      if (nextOne) {
        this[nextOne].setFocus();
      } else {
        document.getElementById("sButton").focus();
      }
    }
  }

  presentAlert() {
    let alert = this.alertCtrl.create({
      title: 'Connection failed.',
      subTitle: 'Cannot connect with IP ' + this.url + '. Double check network settings of your device and IP address of your controller and try again.',
      buttons: ['OK']
    });
    alert.present();
  }
}
