import { Component, ViewChild } from '@angular/core';
import {LoadingController, Loading, AlertController  } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InAppBrowser } from '@ionic-native/in-app-browser';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  public loading: Loading;
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
    this.url = `http://${this.ipObject.ip1}.${this.ipObject.ip2}.${this.ipObject.ip3}.${this.ipObject.ip4}`;
    console.log(this.url);
    if (this.metaForm.valid) {
      this.browser =  this.iab.create(this.url);
      this.browser.insertCSS({ code: "body {background-color: #408080 !important;}" });
      this.browser.reload();
      this.showLoading();
      this.browser.on("loaderror").subscribe(
        (err) => {
          this.browser.close();
          this.presentAlert();
          console.log(err);
        }
      );
      this.browser.on("exit").subscribe(
        (err) => {
          this.browser.close();
          this.presentAlert();
          console.log(err);
        }
      );
      this.metaForm.reset(this.ipObject);
      this.hideLoading();
    }
    else {
      console.log('oops');
    }
  }

  showLoading(message: string = null) {
  //  this.hideLoading();
    this.loading = this.loadingCtrl.create({
      content: message || 'Please wait...',
      dismissOnPageChange: true
    });
    this.loading.present();
  }

  hideLoading() {
    if (!!this.loading) {
      this.loading.dismiss();
      this.loading = undefined;
    }
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
