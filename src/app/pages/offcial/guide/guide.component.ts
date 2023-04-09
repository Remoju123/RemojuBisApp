import { animate } from '@angular/animations';
import { AfterViewInit, Component, Injector, OnInit } from '@angular/core';
import { settings } from 'cluster';
import { doc } from 'firebase/firestore';
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

  ngAfterViewInit(): void {
    let LoadMask = document.getElementById('load__mask');

    setTimeout(() => {
      LoadMask.classList.add('reval');
    }, 800);

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

    // step1
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
      opacity: 0.5,
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

    let step2 = document.querySelector('.section.step2');
    let step2bg1 = document.querySelector(
      '.section.step2 > .screen.scr1 > img'
    );
    let step2bg2 = document.querySelector(
      '.section.step2 > .screen.scr2 > img'
    );
    let step2bg3 = document.querySelector(
      '.section.step2 > .screen.scr3 > img'
    );

    gsap.set(step2bg1, { opacity: 0, x: 1000 });
    gsap.set(step2bg2, { opacity: 0, x: 0 });
    gsap.set(step2bg3, { opacity: 0, x: 0, y: 300 });

    const tl2 = gsap.timeline({
      repeat: -1,
      repeatDelay: 0.8,
      scrollTrigger: {
        trigger: step2,
        start: 'top center',
      },
    });

    tl2.to(step2bg1, {
      keyframes: [
        { duration: 1, x: 0, opacity: 1, delay: 1 },
        { duration: 2, x: 0 },
        { duration: 0.5, x: 1000 },
      ],
    });

    tl2.to(step2bg3, {
      keyframes: [
        { duration: 0.5, x: 0, y: 0, opacity: 1, delay: 1 },
        { duration: 2, x: 0, delay: 1 },
      ],
    });

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

    let step4 = document.querySelector('.section.step4');
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

    /**
     * Marker クリックアニメーション
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

  ngOnInit(): void {}
}
