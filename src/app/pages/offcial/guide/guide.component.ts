import { AfterViewInit, Component, Injector, OnInit } from '@angular/core';
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
    let top = document.querySelector('.section.top');
    let logo = document.querySelector('img.logo');
    let caption = document.querySelector('.caption');

    const tl0 = gsap.timeline();
    tl0.to(top, {
      backgroundColor: '#fff',
      delay: 0.8,
      duration: 1,
    });
    tl0.from(logo, {
      autoAlpha: 0,
      duration: 2,
    }),
      '+=1';
    tl0.to(logo, {
      autoAlpha: 0,
      duration: 0.5,
    });
    tl0.from(
      caption,
      {
        y: 300,
        autoAlpha: 0,
        duration: 1,
      },
      '-=0.5'
    );

    let step1 = document.querySelector('.section.step1');

    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: step1,
        start: 'top top',
        //end: '50% top',
        scrub: 1,
        pin: true,
        //anticipatePin: 1,
        //invalidateOnRefresh: true,
        toggleActions: 'play complete complete complete',
      },
    });

    tl1.to('.mark .balloon', {
      keyframes: [
        {
          opacity: 1,
          duration: 0.5,
          overwrite: true,
          stagger: {
            from: 'start',
            //amount: 0.4,
            each: 1.4,
          },
        },
        {
          opacity: 0,
          //duration: 0.5,
          overwrite: true,
        },
      ],
    });

    // tl1.from(step1, {
    //   opacity: 0,
    //   duration: 0.5,
    // });
    // tl1.fromTo(
    //   '.mark .balloon',
    //   { opacity: 1 },
    //   {
    //     opacity: 0,
    //     duration: 0.2,
    //     repeat: 0,
    //     stagger: { each: 1 },
    //     ease: 'power4in',
    //   }
    // );

    let step2 = document.querySelector('.section.step2');

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: step2,
        start: 'top top',
        //end: '50% top',
        scrub: 1,
        pin: true,
        // anticipatePin: 1,
        // invalidateOnRefresh: true,
      },
    });

    tl2.from(step2, {
      opacity: 0,
      duration: 0.5,
    });

    let step3 = document.querySelector('.section.step3');

    const tl3 = gsap.timeline({
      scrollTrigger: {
        trigger: step3,
        start: 'top top',
        //end: '50% top',
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
        //end: '50% top',
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
