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
                  let absHeight = 500;
                  let vRatio;
                  let hRatio;
                  
                  function zoomIt(){
                    wHeight = window.screen.height;
                    wWidth = window.screen.width;
 
                    vRatio = wHeight / absHeight;
                    hRatio = wWidth / absWidth;

                    wrapper.style.paddingLeft = '0px';
                    
                    if (vRatio >= hRatio) { 
                      hRatio = hRatio;
                      wrapper.style.transform = 'scale(' + hRatio + ')';
                      a = (wWidth - wrapper.offsetWidth * hRatio) / (2 * hRatio);
                    } else {
                      vRatio = vRatio;
                      wrapper.style.transform = 'scale(' + vRatio + ')';
                      a = (wWidth - wrapper.offsetWidth * vRatio) / (2 * vRatio); 
                    }
                    wrapper.style.transformOrigin = 'left top';
                    
                    wrapper.style.paddingLeft =  a +  'px';
                    wrapper.style.paddingTop = '30px';
                    connectButton.style.left = '0px';
                  };
                  zoomIt();
                  
                  window.addEventListener('touchmove', function(e) {
                    e.preventDefault();
                  }, false);
                  
                  window.addEventListener('scroll', function(e) {
                    e.preventDefault();
                  }, false);
                  
                  window.addEventListener('touchstart', function(e){ 
                    e.preventDefault(); 
                  }, false);
                  
                   window.addEventListener('dragstart', function(e){ 
                    e.preventDefault(); 
                  }, false);

                  window.on('orientationchange', function() {
                  alert('1');
                    setTimeout(zoomIt, 100);
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
                  padding: 10px 0 4px 20px;
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
                  top: 12px;
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
