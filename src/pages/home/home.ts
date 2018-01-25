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
          browser.insertCSS({
            code: `body{;
                  margin: 0 !important;
                }
                #customWrapper{
                  margin: 0 auto !important;
                  width: 803px !important;
                }
                #wrapper.border{
                  width: 480px !important;
                  margin: 0 auto;
                  margin-bottom: 10px;
                }
                table{
                  margin: 0 auto !important;
                }
                html{
                  overflow: hidden !important;
                }`
          });

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
                  let absHeight = 600;
                  let vRatio;
                  let hRatio;
                  
                  function zoomIt(){
                    wHeight = window.screen.height;
                    wWidth = window.screen.width;
 
                    vRatio = wHeight / absHeight;
                    hRatio = wWidth / absWidth;
                    

                    wrapper.style.paddingLeft = 0px';
                    
                    if (vRatio >= hRatio) { 
                      wrapper.style.cssText += '; transform:scale(' + hRatio + ');';
                      a = (window.innerWidth - wrapper.offsetWidth * hRatio)/(2 * hRatio);
                    } else {
                      wrapper.style.cssText += '; transform:scale(' + vRatio + ');';
                      a = (window.innerWidth - wrapper.offsetWidth * vRatio)/(2 * vRatio);
                    }
                    wrapper.style.transformOrigin = 'left top';

                    wrapper.style.paddingLeft =  a +  'px';
                    wrapper.style.paddingTop = '30px';

                      
                    
                  };
                  zoomIt();
                  
                  window.addEventListener('touchmove', function(e) {
                    e.preventDefault();
                  }, false);
                  
                  window.addEventListener('scroll', function(e) {
                    e.preventDefault();
                  }, false);
                  
                  window.addEventListener('orientationchange', zoomIt);`
          });
        };
        browser.insertCSS({
          code: `body{
                  
                }
                table, tbody, td, tr{
                  border: 0 !important;
                }
                #closeBrowserButton{
                  padding: 5px 0 5px 20px;
                  margin: 0 auto;
                  position: relative;
                  color: white; 
                  font-size: 4vh;
                  font-weight: bold;
                  text-align: left;
                  line-height: 4vh; 
                  z-index: 99999;
                  width: 100%;
                }
                #outerBrowserButton{ 
                  position: absolute;
                  left: 0
                  float: left;
                  bottom: -40px;
                  background: grey; 
                  width: 100vw;
                  height: 40px;
                  margin-top: 10px;
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
