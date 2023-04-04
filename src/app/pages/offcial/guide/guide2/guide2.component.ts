import { AfterViewInit, Component, OnInit } from '@angular/core';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-guide2',
  templateUrl: './guide2.component.html',
  styleUrls: ['./guide2.component.scss'],
})
export class Guide2Component implements OnInit, AfterViewInit {
  constructor() {}
  ngAfterViewInit(): void {
    let step1 = document.querySelector('.section.step1');

    const tl1 = gsap.timeline({
      repeat: 0,
      repeatDelay: 0.6,
      scrollTrigger: {
        trigger: '.step1',
        start: 'top top',
        end: '50% top',
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
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

  ngOnInit() {}
}
