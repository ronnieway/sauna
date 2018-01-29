import { Component } from '@angular/core';
import { LoadingController, AlertController } from 'ionic-angular';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

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
              private alertCtrl: AlertController,
              private screenOrientation: ScreenOrientation
  ) {
  }

  public submitRequest() {
    this.connecting = true;
    this.theLoading();
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
              this.loader = null;
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
                  let outerButton = document.createElement('div');
                  outerButton.setAttribute('id', 'outerBrowserButton');
                  let button = document.createElement('div');
                  button.innerHTML = '< back';
                  button.setAttribute('id', 'closeBrowserButton');
                  button.onclick = function() { 
                    localStorage.setItem('iab', 'false'); 
                  };
                  outerButton.appendChild(button);
                  body.appendChild(outerButton);
                })();`
        });

        browser.insertCSS({
          code: `body{
                  margin: 0 !important;
                  padding-top: 0;
                }
                #customWrapper{
                  margin: 0 auto !important;
                  width: 803px !important;
                }
                #pmess{
                  margin-top: 90px;
                }
                #wrapper.border{
                  width: 480px !important;
                  margin: 0 auto;
                }
                table{
                  margin: 0 auto !important;
                  width: 100%;
                  height: 100%;
                }
                html{
                  overflow: hidden !important;
                }`
        });

        let iOS = true; /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (iOS){
          browser.executeScript({
            code: `let wrapper = document.createElement("div");
                  wrapper.id = "customWrapper";
                  while (document.body.firstChild)
                  {
                      wrapper.appendChild(document.body.firstChild);
                  }
                  document.body.appendChild(wrapper);
                  
                  let a;
                  let wHeight;
                  let wWidth;
                  let absWidth = 803;
                  let absHeight = 200;
                  let vRatio;
                  let hRatio;
                  
                  function zoomIt(){
                    wHeight = window.screen.height;
                    wWidth = window.screen.width;
 
                    vRatio = wHeight / absHeight;
                    hRatio = wWidth / absWidth;

                    wrapper.style.marginLeft = '0px';
                    
                    if (vRatio >= hRatio) { 
                      hRatio = hRatio;
                      let herehRatio = hRatio * 1.25;
                      wrapper.style.transform = 'scale(' + herehRatio + ')';
                      a = (wWidth - wrapper.offsetWidth * hRatio * 1.25) / 2;
                    } else {
                      vRatio = vRatio;
                      let herevRatio = vRatio * 1.25;
                      wrapper.style.transform = 'scale(' + herevRatio + ')';
                      a = (wWidth - wrapper.offsetWidth * vRatio * 1.25) / 2; 
                    }
                    wrapper.style.transformOrigin = 'left top';
                    alert(a);
                    wrapper.style.marginLeft =  a +  'px';
                    wrapper.style.padding = '0px';
                  };
                  zoomIt();
                  
                  window.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                  }, false);
                  
                  window.addEventListener('scroll', (e) => {
                    e.preventDefault();
                  }, false);
                  
                  window.addEventListener('touchstart', (e) => { 
                    e.preventDefault(); 
                  }, false);
                  
                   window.addEventListener('dragstart', (e) => { 
                    e.preventDefault(); 
                  }, false);`
          });
        };

        browser.insertCSS({
          code: `body{

                }
                table, tbody, td, tr{
                  border: 0 !important;
                }
                #closeBrowserButton{
                  padding: 10px 0 4px 30px;
                  margin: 0 auto;
                  position: relative;
                  color: blue; 
                  font-size: 4vh;
                  font-weight: bold;
                  text-align: left;
                  line-height: 4vh; 
                  z-index: 99999;
                  width: 100%;
                }
                #outerBrowserButton{ 
                  position: fixed;
                  left: 0;
                  float: left;
                  top: 10px;
                  width: 803px;
                  height: 40px;
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
            this.loader = null;
          }
          this.connecting = false;
          browser.show();
        }
      },
      (err) => {
        if(this.connecting) {
          if(this.loader) {
            this.loader.dismiss();
            this.loader = null;
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
            this.loader = null;
          }
          this.connecting = false;
          this.presentAlert();
          browser.close();
        }
      }
    );
  }

  theLoading() {
    if(!this.loader) {
      this.loader = this.loadingCtrl.create({
        content: 'Connecting to server...',
        duration: 30000
      });
      this.loader.present();
    }
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
