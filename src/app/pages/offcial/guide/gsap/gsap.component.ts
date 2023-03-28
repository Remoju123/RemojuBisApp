import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';

import gsap from 'gsap';
// get other plugins:
import ScrollTrigger from 'gsap/ScrollTrigger';
import Flip from 'gsap/Flip';
import Draggable from 'gsap/Draggable';
import { trigger } from '@angular/animations';
import { start } from 'repl';

gsap.registerPlugin(ScrollTrigger, Draggable, Flip);

@Component({
  selector: 'app-gsap',
  templateUrl: './gsap.component.html',
  styleUrls: ['./gsap.component.scss'],
})
export class GsapComponent implements OnInit, AfterViewInit {
  // @ViewChild('animeObject') AnimationObject: ElementRef;

  // @ViewChild('firstcontainer') Firstcontainer: ElementRef;
  // @ViewChild('container') Container: ElementRef;
  // @ViewChild('lastcontainer') Lastcontainer: ElementRef;

  @ViewChild('Shapes') Shapes: ElementRef;
  @ViewChild('JsLoaderBg') JsLoaderBg: ElementRef;
  @ViewChild('Linner') Linner: ElementRef;
  @ViewChild('JsHeader') JsHeader: ElementRef;
  // @ViewChild('Cursor') Cursor: ElementRef;

  constructor() {}

  ngOnInit() {
    //this.layerAnimation();
  }

  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);

    let shapes = gsap.utils.selector(this.Shapes.nativeElement)('.shape');
    let linner = gsap.utils.selector(this.Linner.nativeElement);
    let jsText = linner('.js-mv_title-item span');
    let jsHeader = this.JsHeader.nativeElement;
    let JsLoaderBg = gsap.utils.selector(this.JsLoaderBg.nativeElement);
    let jsDot = JsLoaderBg('.js-loader-dot-wrap > span');
    let jsLoaderBg = this.JsLoaderBg.nativeElement;

    //let cursor = this.Cursor.nativeElement;

    gsap.set([shapes, jsText], {
      opacity: 0,
      y: 30,
    });
    gsap.set(jsHeader, {
      opacity: 0,
      y: -50,
    });
    gsap.set(jsDot, {
      opacity: 0,
      y: -50,
    });

    const tl = gsap.timeline({
      // scrollTrigger: {
      //   trigger: jsLoaderBg,
      //   start: 'top top',
      //   //end: '+=900',
      //   scrub: true,
      //   pin: true,
      // },
    });
    tl.to(
      /* 0.8秒後に起動 */
      jsDot,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.8,
        stagger: {
          amount: 0.5, //0.5秒おきに
          from: 'start', // 左から
          ease: 'power4.inOut',
        },
      }
    )
      .to(jsDot, {
        opacity: 0,
      })
      .to(jsLoaderBg, {
        y: '100%',
        delay: 0.5,
      })
      .to(
        shapes,
        {
          /* 0.2秒後に、1秒かけてバブルが個別にアニメーション */
          opacity: 1,
          y: 0,
          duration: 0.8, // seconds
          stagger: {
            amount: 0.6,
            from: 'start',
            ease: 'sine.in',
          },
        },
        '+=0.2'
      )
      .to(
        jsText,
        {
          /* 前のアニメーションが完了する0.1秒前に実行 */
          opacity: 1,
          y: 0,
          stagger: {
            amount: 1,
            from: 'start',
            ease: 'sine.in',
          },
        },
        '-=0.1'
      );
    // .to(jsLoaderBg, {
    //   y: '0%',
    //   delay: 0.5,
    //   backgroundColor: '#fff',
    // });
    // .to(jsHeader, {
    //   opacity: 1,
    //   y: 0,
    // });

    document.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      gsap.set('.cursor', {
        x: mouseX,
        y: mouseY,
      });
    });
    /*
    let sections = gsap.utils.toArray('.panel');

    this.firstAnimation();
    let first = gsap.utils.selector(this.Firstcontainer.nativeElement);
    let logo = first('.logo');
    gsap.to(logo, { x: 100 });

    gsap.to(logo, { y: 100 });

    let container = this.Container.nativeElement;

    gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        end: () => '+=' + container.offsetWidth,
      },
    });
    */
  }

  /*
  layerAnimation() {
    // let anime: TimelineMax = new TimelineMax();
    // anime.from(this.AnimationObject.nativeElement, 1, { x: -200, opacity: 0 });
    // return anime;
    gsap.to(this.AnimationObject.nativeElement, {
      x: 200,
      rotation: 360,
      duration: 2,
    });
  }

  firstAnimation() {
    let first = gsap.utils.selector(this.Firstcontainer.nativeElement);
    let con = first('.firstContainer');
    let logo = first('.logo');

    const tl = gsap.timeline({
      repeat: 1,
      repeatDelay: 0.5,
      scrollTrigger: {
        trigger: '.trigger',
        start: 'center bottom',
        end: 'center top',
        scrub: true,
        markers: true,
      },
    });
    tl.to(logo, { y: -100, duration: 1 });
    tl.to(logo, { opacity: 0, duration: 1 });
  }

  firstScrollEvent() {
    let first = gsap.utils.selector(this.Firstcontainer.nativeElement);
  }
  */
}
