import {AuthConfig} from "angular-oauth2-oidc";

export const authConfig:AuthConfig = {

  // Url of the Identity Provider
  issuer: 'https://remojuauth.b2clogin.com/cd47aab8-27f9-4c8e-9d47-14663c619980/v2.0/',
 
  // URL of the SPA to redirect the user to after login
  //redirectUri: window.location.origin + '/',
  redirectUri: 'http://localhost:4200/',

  //silentRefreshRedirectUri:window.location.origin + '/silent-refresh.html',
  silentRefreshRedirectUri: 'http://localhost:4200/silent-refresh.html',
 
  // The SPA's id. The SPA is registered with this id at the auth-server
  clientId: '3e5bffaf-86d7-4a4c-bcde-6ba4d1cb52d3',

  // responseType:'code',
 
  // set the scope for the permissions the client should request
  // The first three are defined by OIDC. The 4th is a usecase-specific one
  //scope: 'openid ebce2d28-8fb8-4cc7-83ae-accc9d73ee9d',
  scope: 'openid 3e5bffaf-86d7-4a4c-bcde-6ba4d1cb52d3',

  strictDiscoveryDocumentValidation: false,

  showDebugInformation: true,

  sessionChecksEnabled: false

}
