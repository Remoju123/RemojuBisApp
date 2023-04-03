import { AfterViewInit, Component, Injector, OnInit } from '@angular/core';
import gsap from 'gsap';

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

    document.querySelectorAll('.mark').forEach((mark) => {
      mark.addEventListener('mouseover', () => {
        const tl = gsap.timeline();
        tl.to(mark, {
          scale: 1.05,
          duration: 0.5,
          overwrite: true,
        });
        tl.to(mark.firstChild, {
          scale: 1,
          opacity: 1,
          duration: 0.2,
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
