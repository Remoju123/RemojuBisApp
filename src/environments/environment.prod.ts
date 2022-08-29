//let locationhost = `${window.location.protocol}//${window.location.host}`;
let locationhost = `https://remoju-app-v3-u.azurewebsites.net`;

export const environment = {
  production: true,
  defaultLang:"ja",
  languages: [{ lang: "en", label: "EN" }, { lang: "ja", label: "JP" }],
  host: locationhost + "/app",
  location: locationhost + "/",
  openidConf:"https://remojuauth.b2clogin.com/remojuauth.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1A_signup_signin",
  backend: "https://remoju-api-v2-dev.azurewebsites.net",
  blobUrl: "https://ik.imagekit.io/2qejhoz7bda",
  // pwdreset:"https://remojuauth.b2clogin.com/remojuauth.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_PasswordReset&client_id=3e5bffaf-86d7-4a4c-bcde-6ba4d1cb52d3&nonce=defaultNonce&redirect_uri=" + window.location.origin + "&scope=openid&response_type=id_token&prompt=login",
  pwdreset:"",
  indexeddbValidityPeriod: 14,
  apiKey: "AIzaSyC8Kodz9bFEhBGkTlBF0PeOk6QT9hpL9hk",
  analytics: {
    id: 'G-WD8D3WTZS4'
  }
};
