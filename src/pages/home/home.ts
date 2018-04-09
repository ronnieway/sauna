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
          let iOS = true; // /iPad|iPhone|iPod/.test(navigator.userAgent);
          if (iOS){
            browser.executeScript({
              code: `let wrapper = document.createElement("div");
                    wrapper.id = "customWrapper";
                    while (document.body.firstChild) {
                      wrapper.appendChild(document.body.firstChild);
                    } 
                    document.body.appendChild(wrapper);
                    if (!!document.getElementById('wrap')) {
                      wrapper.style.margin = 'auto';
                    }
                    
                    let a;
                    let wHeight;
                    let wWidth;
                    let absWidth = 803;
                    let absHeight = 600;
                    let vRatio;
                    let hRatio;
                    
                    function zoomIt(){
                      wHeight = window.innerHeight;
                      wWidth = window.innerWidth;
   
                      vRatio = wHeight / absHeight * 0.8;
                      hRatio = wWidth / absWidth;
  
                      wrapper.style.paddingLeft = '0px';
                      
                      if (vRatio >= hRatio) { 
                        wrapper.style.cssText += '; -webkit-transform:scale(' + hRatio + '); transform:scale(' + hRatio + ');';
                        wrapper.style.transformOrigin = 'left top';
                        a = (window.innerWidth - wrapper.offsetWidth * hRatio)/2;
                      } else {
                        wrapper.style.cssText += '; -webkit-transform:scale(' + vRatio + '); transform:scale(' + vRatio + ');';
                        wrapper.style.transformOrigin = 'left top';
                        a = (window.innerWidth - wrapper.offsetWidth * vRatio)/2;
                      }
                      
                      if (wHeight < wWidth){
                        a = a*1.75;
                        wrapper.style.paddingLeft =  a + 'px';   
                      } else {
                        wrapper.style.paddingLeft = '0px';
                      }
                      wrapper.style.paddingTop = '0px'; 
                    }; 
                    zoomIt();
                    
                    window.addEventListener('touchmove', (e) => {
                      e.preventDefault();
                    }, false);
                    
                    window.addEventListener('scroll', (e) => {
                      e.preventDefault();
                    }, false);
                    
                    window.addEventListener('dragstart', (e) => { 
                      e.preventDefault(); 
                    }, false);
                    
                    window.addEventListener('orientationchange', zoomIt);`
            });
          } else {
            browser.executeScript({
              code: `localStorage.setItem('iab', 'true');
                    if (window.screen.height > window.screen.width && !!document.getElementById('wrap')) {
                      document.body.style.marginLeft = '7%';
                    } else {
                      document.body.style.marginLeft = 'auto';
                    }`
            });
          }

          browser.insertCSS({
            code: `body{ 
                    background-color: #408080 !important;
                    margin: 10px 0 0 0 !important;
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
                  #customWrapper{
                    margin: 0 auto;
                    width: 803px;
                    position: relative;
                    overflow: hidden;
                  }
                  `
          });

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
