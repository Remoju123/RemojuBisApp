// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
//let locationhost = `${window.location.protocol}//${window.location.host}`;
let locationhost = `http://localhost:4200`;
//let locationhost = `http://10.0.1.13:4200`;
export const environment = {
  production: false,
  defaultLang:"ja",
  languages: [{ lang: "en", label: "EN" }, { lang: "ja", label: "JP" }],
  host: locationhost + "/app",
  location: locationhost + "/",
  openidConf:"https://remojuauth.b2clogin.com/remojuauth.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1A_signup_signin",
  backend: "https://remoju-api-v2-dev.azurewebsites.net",
  // backend: "https://localhost:44367",
  blobUrl: "https://remoju.blob.core.windows.net",
  // pwdreset:"https://remojuauth.b2clogin.com/remojuauth.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_PasswordReset&client_id=3e5bffaf-86d7-4a4c-bcde-6ba4d1cb52d3&nonce=defaultNonce&redirect_uri=" + window.location.origin + "&scope=openid&response_type=id_token&prompt=login",
  pwdreset:"",
  indexeddbValidityPeriod: 14
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
