import { Overlay,OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Injectable,Injector } from '@angular/core';
import { 
  SPINNER_LOADING_INDICATOR_OPTIONS,
  SpinnerLoadingIndicatorComponent,
  SpinnerLoadingIndicatorOptions
} from '../parts/spinner-loading-indicator/spinner-loading-indicator.component';

export interface LoadingIndicatorRef {
  close(): void;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingIndicatorService {

  constructor(
    private readonly _injector: Injector,
    private readonly _overlay: Overlay
  ) { }

  show(options?: SpinnerLoadingIndicatorOptions): LoadingIndicatorRef {
    // Injectorの作成
    const injector = new PortalInjector(this._injector, new WeakMap([
      [SPINNER_LOADING_INDICATOR_OPTIONS, options]
    ]));
    const overlayRef = this._createOverlay();
    const portal = new ComponentPortal(SpinnerLoadingIndicatorComponent,null,injector);
    overlayRef.attach(portal);
  
    return {
      close() {
        overlayRef.detach();
        overlayRef.dispose();
      }
    };
  }

  private _createOverlay(): OverlayRef {
    return this._overlay.create({
      width: '100%',
      height: '100%',
      hasBackdrop: true,
      panelClass: 'app-loading-indicator',
      backdropClass: 'app-loading-indicator-backdrop',
    });
  }
}
