import {
  Component,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { OAuthService, OAuthErrorEvent } from 'angular-oauth2-oidc';
import { OAuthErrorEventParams } from './class/common.class';
import { authConfig } from './auth.config';
import { CommonService } from './service/common.service';
import { GaService } from './service/ga.service';
import { UserService } from './service/user.service';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { environment } from '../environments/environment';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

import {
  trigger,
  animateChild,
  group,
  transition,
  animate,
  style,
  query,
  state,
} from '@angular/animations';

export const routeChangeAnimation = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ],
      { optional: true }
    ),
    query(':enter', [style({ opacity: '0' })], { optional: true }),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(':leave', [animate('2250ms', style({ opacity: '0' }))], {
        optional: true,
      }),
      query(':enter', [animate('2250ms', style({ opacity: '1' }))], {
        optional: true,
      }),
    ]),
    query(':enter', animateChild(), { optional: true }),
  ]),
]);

export const blockInitialRenderAnimation = trigger(
  'blockInitialRenderAnimation',
  [transition(':enter', [])]
);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routeChangeAnimation],
})
export class AppComponent implements OnInit, OnDestroy {
  //title = 'RemojuApp-V3U';
  show = false;
  private onDestroy$ = new Subject();

  constructor(
    private oauthService: OAuthService,
    private commonService: CommonService,
    private gaService: GaService,
    private userService: UserService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(platformId)) {
      this.show = true;
      // tracking
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((params: any) => {
          //this.gaService.sendPageView(params.url);
        });
    }
  }

  ngOnInit() {
    //if (isPlatformBrowser(this.platformId)) {
    this.oauthService.events.subscribe((e) => {
      if (e instanceof OAuthErrorEvent) {
        const parm = e.params as OAuthErrorEventParams;
        // console.log(e.params);
        if (e.params !== null) {
          if (
            parm.error === 'access_denied' &&
            parm.error_description.includes('AADB2C90118')
          ) {
            // redirect to forgot password flow
            // console.log(parm.error_description);
            // console.log("redirect to forgot password flow");
            window.location.href =
              'https://remojuauth.b2clogin.com/remojuauth.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1A_PasswordReset&client_id=3e5bffaf-86d7-4a4c-bcde-6ba4d1cb52d3&nonce=defaultNonce&redirect_uri=' +
              window.location.origin +
              '&scope=openid&response_type=id_token&prompt=login';
          }
          //AADB2C90006
          // else if (parm.error === 'access_denied' && parm.error_description.includes('AADB2C90091')) {
          //   // user has cancelled out of password reset
          //   //this.oauthService.initLoginFlow();
          //   //this.oauthService.initImplicitFlow(state.url);
          // }else{
          // }
        }
      }
    });

    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();
    this.oauthService.timeoutFactor = 0.1;
    this.oauthService.loadDiscoveryDocument(environment.openidConf);
    this.oauthService
      .tryLogin()
      .then(async () => {
        if (
          this.oauthService.hasValidAccessToken() &&
          this.oauthService.hasValidIdToken()
        ) {
          const guid = await this.commonService.getGuid();
          this.userService
            .userCompletion(guid)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((r) => {
              if (r) {
                this.commonService.loggedIn = true;
                this.commonService.onUpdHeader();

                if (localStorage.getItem('iskeep') === null) {
                  this.commonService.snackBarDisp('LoginMessage');
                  localStorage.setItem('iskeep', 'true');
                }

                const state = this.oauthService.state;

                if (state.length > 0) {
                  this.router.navigateByUrl(state);
                }
              }
            });
          return Promise.resolve();
        } else {
          this.commonService.loggedIn = false;
        }
      })
      .catch(() => {
        console.log('oauth trylogin error');
      });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
  }
}
