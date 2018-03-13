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
  public ip = [10,10,0,2];
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
          let iOS = true;// /iPad|iPhone|iPod/.test(navigator.userAgent);
          if (iOS){
            browser.executeScript({
              code: `localStorage.setItem('iab', 'true');
                    let outerButton;
                    let button;
                    if (window.screen.height > window.screen.width && !!document.getElementById('wrap')) {
                      document.body.style.marginLeft = '7%';
                    } else {
                      document.body.style.marginLeft = 'auto';
                    }
                      
                    if (!!document.getElementById('outerBrowserButton') && !!document.getElementById('closeBrowserButton')){
                      outerButton = document.getElementById('outerBrowserButton');
                      button = document.getElementById('closeBrowserButton');

                    } else {
                      setTimeout(function() {
                        outerButton = document.createElement('div');
                        outerButton.setAttribute('id', 'outerBrowserButton');
                        button = document.createElement('div');
                        button.innerHTML = '< Home';
                        button.setAttribute('id', 'closeBrowserButton');
                        button.onclick = function() {
                          localStorage.setItem('iab', 'false');
                        };
                        outerButton.appendChild(button);
                        document.body.appendChild(outerButton);
                      }, 1000);
                    }`
            });
          }

          browser.insertCSS({
            code: `body{ 
                    background-color: #408080 !important;
                    margin: 25px 0 0 0 !important;
                  }
                  #pmess{
                    margin-top: 10px;
                  }
                  #wrapper.border{
                    width: 480px;
                    margin: 0 auto;
                  }
                  html{
                    overflow: hidden !important;
                    background-color: #408080 !important;
                  }
                  table, tbody, td, tr{
                    border: 0 !important;
                  }
                  #closeBrowserButton{
                    padding: 5px 0 0 15px;
                    margin: 0 auto;
                    position: relative;
                    color: white; 
                    font-size: 16px;
                    font-weight: bold;
                    text-align: left;
                    line-height: 18px; 
                    z-index: 99999;
                    width: 100%;
                  }
                  #outerBrowserButton{ 
                    position: fixed;
                    left: 0;
                    float: left;
                    top: 0;
                    width: 803px;
                    margin-top: 30px;
                    z-index: 99998;
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
