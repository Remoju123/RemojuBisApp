import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-app-shell',
  template: `      
      <div class="loader"></div>
      <span class="loader-text">Loading...</span>
  `,
  styles: [`
      app-root {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: gray;
        }
        
      .loader {
          border: 1px solid #f3f3f3;
          border-top: 1px solid #4055ae;
          border-radius: 50%;
          width: 120px;
          height: 120px;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }

        .loader-text {
          display: block;
          margin-top: 1em;
        }
  `]
})
export class AppShellComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
