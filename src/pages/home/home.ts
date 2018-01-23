import { Component } from '@angular/core';
import { LoadingController, AlertController } from 'ionic-angular';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  private loader;
  private connecting: boolean = false;
  public ip = [10,0,1,15];
  public url = `http://${this.ip[0]}.${this.ip[1]}.${this.ip[2]}.${this.ip[3]}`;

  constructor(private iab: InAppBrowser,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController
  ) {
  }

  public submitRequest() {
    this.connecting = true;
    this.theLoading();
    this.loader.present();
    const options: InAppBrowserOptions = {
      zoom:'no',
      location:'no',
      toolbar:'no',
      hidden:'yes'
    };
    let browser =  this.iab.create(this.url, '_blank', options);
    browser.on('loadstart')
    .subscribe(
      (event) => {
        setTimeout(() => {
          if(this.connecting){
            if(this.loader) {
              this.loader.dismiss();
            }
            this.connecting = false;
            this.presentAlert();
            browser.close();
          }
        }, 30000);
      }
    );

    browser.on('loadstop')
    .subscribe(
      (event) => {
        browser.executeScript({
          code: `localStorage.setItem('iab', 'true');
                (function() {
                  let body = document.querySelector('body');
                  let button = document.createElement('div');
                  button.innerHTML = '<< back to connect';
                  button.setAttribute('id', 'closeBrowserButton');
                  button.onclick = function() { 
                    localStorage.setItem('iab', 'false'); 
                  };
                  body.appendChild(button);
                })();`
        });


          browser.executeScript({
            code: `let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                  if (iOS){
                    (function(){
                      let body = document.querySelector('body');
                      let wWidth = window.screen.width;
                      let wHeight = window.screen.height;
                      const absWidth = 803;
                      const absHeight = 600;
                      let vRatio;
                      let hRatio;
                      vRatio = wHeight / absHeight;
                      hRatio = wWidth / absWidth;
                      alert('1');
                      if (vRatio >= hRatio) { 
                        body.style.cssText += '; transform:scale(' + hRatio + ');';
                      } else {
                        body.style.cssText += '; transform:scale(' + vRatio + ');';
                      }
                      body.style.cssText += '; transform:translate(0,0);';
                    })();
                  };`
          });


        browser.insertCSS({
          code: `table, tbody, td, tr{
                  border: 0 !important;
                }
                table{
                  object-fit: contain !important;
                }
                #closeBrowserButton{
                  position: fixed; 
                  bottom: 0 !important;
                  left: 0 !important; 
                  height: 30px;
                  width: 100%; 
                  background: grey; 
                  color: white; 
                  padding: 10px; 
                  font-size: 3vh;
                  font-weight: bold;
                  text-align: center;
                  line-height: 4vh; 
                  z-index: 9999;
                }`
        });

        let checkingClick = setInterval(() => {
          browser.executeScript({
            code: `let result = function(){
                  return localStorage.iab;
                  };
                  result();`
            })
            .then(val =>{
              if (val[0] == 'false'){
                clearInterval(checkingClick);
                browser.close();
              }
            });
        }, 1000);

        if(this.connecting) {
          if (this.loader) {
            this.loader.dismiss();
          }
          this.connecting = false;
          browser.show();
        }
      },
      (err) => {
        if(this.connecting) {
          if(this.loader) {
            this.loader.dismiss();
          }
          this.connecting = false;
          this.presentAlert();
          browser.close();
        }
      }
    );

    browser.on("loaderror")
    .subscribe(
      (err) => {
        if (this.connecting) {
          if (this.loader) {
            this.loader.dismiss();
          }
          this.connecting = false;
          this.presentAlert();
          browser.close();
        }
      }
    );
  }

  theLoading() {
    this.loader = this.loadingCtrl.create({
      content: 'Connecting to server...',
      duration: 30000
    });
  }

  presentAlert() {
    let alert = this.alertCtrl.create({
      title: 'Connection failed.',
      subTitle: `Connection to cryosauna is unavailable! Double check connection to Wi-Fi network CryoXXXX and reload the application!`,
      buttons: ['OK']
    });
    alert.present();
  }
}
