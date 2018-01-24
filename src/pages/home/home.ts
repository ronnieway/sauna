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
        browser.insertCSS({
          code: `body{
                  width: 803px !important;
                  padding: 5px;
                }`
        });

        browser.executeScript({
          code: `localStorage.setItem('iab', 'true');
                (function() {
                  let body = document.querySelector('body');
                  let outerButton = document.createElement('div');
                  outerButton.setAttribute('id', 'outerBrowserButton');
                  let button = document.createElement('div');
                  button.innerHTML = '<< back to connect';
                  button.setAttribute('id', 'closeBrowserButton');
                  button.onclick = function() { 
                    localStorage.setItem('iab', 'false'); 
                  };
                  outerButton.appendChild(button);
                  body.appendChild(outerButton);
                })();`
        });

        let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (iOS){
          browser.executeScript({
            code: `let body = document.querySelector('body');
                  let zoomIt = function(){
                    let wWidth = window.screen.width;
                    let wHeight = window.screen.height;
                    let absWidth = 803;
                    let absHeight = 600;
                    let vRatio = wHeight / absHeight;
                    
                    let leftPad = absWidth - absWidth * hRatio;
                    let topPad = absHeight - absHeight * vRatio;
                    if (vRatio >= hRatio) { 
                      body.style.cssText += '; transform:scale(' + hRatio + ');';
                    } else {
                      body.style.cssText += '; transform:scale(' + vRatio + ');';
                    }
                    
                    alert('done');
                  };
                  zoomIt();
                  body.addEventListener('touchmove', function(e) {
                    e.preventDefault();
                  }, false);
                  body.addEventListener('scroll', function(e) {
                    e.preventDefault();
                  }, false);
                  function doOnOrientationChange() {
                    switch(window.orientation) {  
                      case -90 || 90:
                        zoomIt();
                        break; 
                      default:
                        zoomIt();
                        break; 
                    }
                  };
                  window.addEventListener('orientationchange', doOnOrientationChange);`
          });
        };
        browser.insertCSS({
          code: `body{
                  overflow:hidden;
                  background-color:white;
                }
                table, tbody, td, tr{
                  border: 0 !important;
                }
                #closeBrowserButton{
                  padding: 5px 0 5px 0;
                  margin: 0 auto;
                  position: relative;
                  color: white; 
                  font-size: 4vh;
                  font-weight: bold;
                  text-align: center;
                  line-height: 4vh; 
                  z-index: 99999;
                  width: 100%;
                  height: 30px;
                }
                #outerBrowserButton{ 
                  position: absolute;
                  left: 0;
                  bottom: 0;
                  float: left;
                  background: grey; 
                  width: 803px;
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
