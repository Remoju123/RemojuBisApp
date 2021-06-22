import { ChangeDetectionStrategy, Component, Inject, InjectionToken, OnInit, Optional } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
/**
 * Indicatorを表示するときのオプション
 */
export interface SpinnerLoadingIndicatorOptions {
  color?: ThemePalette;
  diameter?: number;
  strokeWidth?: number;
}

/**
 * オプションのデフォルト値
 */
const DEFAULT_OPTIONS: SpinnerLoadingIndicatorOptions = { color: 'primary', diameter: 100, strokeWidth: 1 };


/**
 * オプションを受け取るためのトークン
 */
export const SPINNER_LOADING_INDICATOR_OPTIONS = new InjectionToken<SpinnerLoadingIndicatorOptions>('SPINNER_LOADING_INDICATOR_OPTIONS');


@Component({
  selector: 'app-spinner-loading-indicator',
  templateUrl: './spinner-loading-indicator.component.html',
  styleUrls: [ './spinner-loading-indicator.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerLoadingIndicatorComponent implements OnInit {

  /**
   * Indicatorの色
   */
  color: ThemePalette;

  /**
   * Indicatorの直径
   */
  diameter: number;

  /**
   * Indicatorの線の太さ
   */
  strokeWidth: number;

  constructor(@Optional() @Inject(SPINNER_LOADING_INDICATOR_OPTIONS) options?: SpinnerLoadingIndicatorOptions) {
    options = Object.assign({}, DEFAULT_OPTIONS, options || {});
    this.color = options.color;
    this.diameter = options.diameter;
    this.strokeWidth = options.strokeWidth;
  }

  ngOnInit() {
  }

}
