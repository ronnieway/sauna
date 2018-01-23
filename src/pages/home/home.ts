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
  public url = `http://10.0.1.15`; //`http://10.10.0.2`;

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
        if (event.url === 'http://10.0.1.15/PAGE1.XML' || event.url === 'http://10.0.1.15/page1.xml' || event.url === 'http://10.0.1.15/PAGE21.XML') {
          browser.executeScript({
            code: `localStorage.setItem('iab', 'true');
                    let iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                    alert(iOS);
                    
                      (function(){
                        let all = document.querySelectorAll('table, tbody, tr, td, div, form, input');
                        let wWidth = window.screen.width;
                        let wHeight = window.screen.height;
                        let bodyRect = document.body.getBoundingClientRect();
                        const absWidth = 803;
                        const absHeight = 600;
                
                        for (let i=0, max=all.length; i < max; i++) {
                          let el = all[i];
                          let elHeight = el.offsetHeight;
                          let elWidth = el.offsetWidth;
                          let elemRect = el.getBoundingClientRect();
                          let vRatio;
                          let hRatio;
                          let hOffset   = elemRect.left - bodyRect.left;
                          let vOffset   = elemRect.top - bodyRect.top;
                          vRatio = wHeight / absHeight;
                          hRatio = wWidth / absWidth;
                          let h = elHeight * vRatio;
                          el.style.height = h.toFixed(0);
                          let w = elWidth * hRatio;
                          w = w.toFixed(0);
                          el.setAttribute('style', 'width:" + w + "px !important');
                          el.style.cssText += '; width:" + w + "px !important;';
                          alert('elWidth: ' + elWidth + ', hRatio: ' + hRatio + ', w: ' + w + ', el.style.width: ' + el.style.width);
                          let l = vOffset * vRatio;
                          el.style.top = l.toFixed(0);
                          let t = hOffset * hRatio;
                          el.style.left = t.toFixed(0);
                        }
                      })();
                        
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
          browser.insertCSS({
            code: `body{
                    background-color: #408080 !important; 
                    margin: 0 !important; 
                    width: 100vw !important;
                  }
                  table, tbody, td, tr{
                    border: 0 !important;
                  }
                  table{
                    object-fit: contain !important;
                  }`
          });
        };

        browser.insertCSS({
          code: `#closeBrowserButton{
                  position: fixed; 
                  bottom: 0 !important;
                  left: 0; 
                  height: 30px;
                  width: 100%; 
                  background: grey; 
                  color: white; 
                  padding: 10px; 
                  font-size: 3vh;
                  font-weight: bold;
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
