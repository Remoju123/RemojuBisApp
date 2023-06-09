import { AfterViewInit, Component, OnInit } from '@angular/core';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss'],
})
export class GuideComponent implements OnInit, AfterViewInit {
  constructor() {}

  isPc: boolean = true;

  ngAfterViewInit(): void {
    let LoadMask = document.getElementById('load__mask');

    setTimeout(() => {
      LoadMask.classList.add('reval');
    }, 800);

    let Cont = document.getElementById('cont');
    let top = document.querySelector('.section.top');
    let logo = document.querySelector('img.logo');
    let caption = document.querySelector('.caption');
    let scroll = document.querySelector('.scroll');

    const tl0 = gsap.timeline();
    tl0.from(logo, {
      autoAlpha: 0,
      duration: 3,
    }),
      '+=1';
    tl0.to(logo, {
      autoAlpha: 0,
      duration: 0.5,
    });
    tl0.from(
      caption,
      {
        y: -300,
        autoAlpha: 0,
        duration: 1,
      },
      '-=0.5'
    );
    tl0.from(
      scroll,
      {
        autoAlpha: 0,
        duration: 1,
      },
      '<'
    );

    let mm = gsap.matchMedia();
    mm.add('(max-width:1024px)', () => {
      this.isPc = false;
      /**
       * step1 *************************************************
       */
      let step1 = document.querySelector('.section.step1');
      const tl1 = gsap.timeline({
        scrollTrigger: {
          trigger: step1,
          start: 'top top',
          end: 'bottom -=100',
          scrub: 1,
          pin: true,
          //anticipatePin: 1,
          //invalidateOnRefresh: true,
          //toggleActions: 'play complete complete complete',
          //markers: true,
        },
      });

      tl1.from(step1, {
        opacity: 0.9,
        duration: 0.2,
      });

      const mark11 = document.getElementById('mark11');
      const mark12 = document.getElementById('mark12');
      const mark13 = document.getElementById('mark13');
      const mark14 = document.getElementById('mark14');
      const mark15 = document.getElementById('mark15');
      const mark16 = document.getElementById('mark16');

      const dy1 = 0;
      ScrollTrigger.create({
        trigger: step1,
        //once: true,
        start: 'top top',
        onEnter: () => {
          const tl = gsap.timeline();
          tl.from(mark11, { left: -200, delay: dy1, duration: 0.5 });
          tl.from(mark12, { left: -170, delay: dy1, duration: 0.5 });
          tl.from(mark13, { right: -170, delay: dy1, duration: 0.5 });
          tl.from(mark14, { left: -170, delay: dy1, duration: 0.5 });
          tl.from(mark15, { right: -170, delay: dy1, duration: 0.5 });
          tl.from(mark16, { right: -170, delay: dy1, duration: 0.5 });
        },
      });

      /**
       * step2 *************************************************
       */
      let step2 = document.querySelector('.section.step2');
      let step2bg1 = document.querySelector(
        '.section.step2 > .screen.scr1 > img'
      );
      // let step2bg2 = document.querySelector(
      //   '.section.step2 > .screen.scr2 > img'
      // );
      let step2bg3 = document.querySelector(
        '.section.step2 > .screen.scr3 > img'
      );

      gsap.set(step2bg1, { opacity: 0, x: 1000 });
      //gsap.set(step2bg2, { opacity: 0, x: 0 });
      gsap.set(step2bg3, { opacity: 0, x: 0, y: 300 });

      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: step2,
          start: 'top top',
          end: 'bottom -=100',
          scrub: 1,
          pin: true,
        },
      });

      tl2.from(step2, {
        opacity: 0.5,
        duration: 0.2,
      });

      tl2.to(step2bg1, {
        keyframes: [
          { duration: 21, x: 0, opacity: 1, delay: 1, ease: 'power4.in,' },
          { duration: 2, x: 0 },
          { duration: 2, x: 1000, opacity: 0, delay: 1, ease: 'power4.out' },
        ],
      });

      tl2.to(step2bg3, {
        keyframes: [
          { duration: 0.5, x: 0, y: 0, opacity: 1, delay: 1 },
          { duration: 2, x: 0, delay: 1 },
        ],
      });

      /**
       * step3 *************************************************
       */
      let step3 = document.querySelector('.section.step3');
      const tl3 = gsap.timeline({
        scrollTrigger: {
          trigger: step3,
          start: 'top top',
          end: 'bottom -=100',
          scrub: 1,
          pin: true,
          // anticipatePin: 1,
          // invalidateOnRefresh: true,
        },
      });

      tl3.from(step3, {
        opacity: 0,
        duration: 0.5,
      });

      /**
       * step4 *************************************************
       */
      let step4 = document.querySelector('.section.step4');
      let step4bg1 = document.querySelector(
        '.section.step4 > .screen.scr1 > img'
      );
      let step4bg2 = document.querySelector(
        '.section.step4 > .screen.scr2 > img'
      );
      gsap.set(step4bg1, { opacity: 1 });
      gsap.set(step4bg2, { opacity: 0 });

      const tl4 = gsap.timeline({
        scrollTrigger: {
          trigger: step4,
          start: 'top top',
          end: 'bottom -=100',
          scrub: 1,
          pin: true,
          // anticipatePin: 1,
          // invalidateOnRefresh: true,
        },
      });

      tl4.from(step4, {
        opacity: 0,
        duration: 0.5,
      });

      tl4.to(step4bg1, {
        opacity: 1,
        duration: 2,
      });

      tl4.to(step4bg2, {
        opacity: 1,
        duration: 2,
      });
    });

    mm.add('(min-width:1025px)', () => {
      this.isPc = true;
      let scr21 = document.querySelector('.scr21');
      let scr22 = document.querySelector('.scr22');

      gsap.set(scr22, { y: 200, x: 150 });

      let scr31 = document.querySelector('.scr31');
      let scr32 = document.querySelector('.scr32');

      gsap.set(scr32, { y: 200, x: 150 });

      let scr41 = document.querySelector('.scr41');
      let scr42 = document.querySelector('.scr42');

      gsap.set(scr42, { y: 350, x: 150 });
    });

    /**
     * Marker クリックアニメーション *****************************
     */
    document.querySelectorAll('.mark').forEach((mark) => {
      mark.addEventListener('mouseover', () => {
        const tl = gsap.timeline();
        tl.to(mark, {
          scale: 1.1,
          duration: 0.5,
          overwrite: true,
        });
        tl.to(mark.firstChild, {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          overwrite: true,
        });
      });
      mark.addEventListener('mouseout', () => {
        const tl = gsap.timeline();
        tl.to(mark, {
          scale: 1,
          duration: 0.5,
          overwrite: true,
        });
        tl.to(mark.firstChild, {
          scale: 1,
          opacity: 0,
          duration: 0.2,
          overwrite: true,
        });
      });
    });
  }

  ngOnInit() {}
}
