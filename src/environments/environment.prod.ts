//let locationhost = `${window.location.protocol}//${window.location.host}`;
//let locationhost = `https://remoju-app-v3-u.azurewebsites.net`;
let locationhost = `https://www.remoju.com`;


export const environment = {
  firebase: {
    projectId: 'remoju-web-master',
    appId: '1:358334806643:web:56b8d10977f80527678806',
    storageBucket: 'remoju-web-master.appspot.com',
    locationId: 'us-central',
    apiKey: 'AIzaSyBClxmgTI-wh06eGIKJfv9iiF00nzKhSfA',
    authDomain: 'remoju-web-master.firebaseapp.com',
    messagingSenderId: '358334806643',
    measurementId: 'G-XRRT975Q6X',
  },
  production: true,
  defaultLang:"ja",
  languages: [{ lang: "en", label: "EN" }, { lang: "ja", label: "JP" }],
  host: locationhost + "/app",
  location: locationhost + "/",
  openidConf:"https://remojuauth.b2clogin.com/remojuauth.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1A_signup_signin",
  backend: "https://remoju-api-v3.azurewebsites.net",
  blobUrl: "https://ik.imagekit.io/2qejhoz7bda",
  // pwdreset:"https://remojuauth.b2clogin.com/remojuauth.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_PasswordReset&client_id=3e5bffaf-86d7-4a4c-bcde-6ba4d1cb52d3&nonce=defaultNonce&redirect_uri=" + window.location.origin + "&scope=openid&response_type=id_token&prompt=login",
  pwdreset:"",
  indexeddbValidityPeriod: 14,
  apiKey: "AIzaSyBClxmgTI-wh06eGIKJfv9iiF00nzKhSfA",
  analytics: {
    id: 'G-WD8D3WTZS4'
  }
};
