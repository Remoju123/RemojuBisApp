import { Component, OnInit } from "@angular/core";
import { LoadingIndicatorService } from '../../service/loading-indicator.service';

@Component({
  selector: "app-top",
  templateUrl: "./top.component.html",
  styleUrls: ["./top.component.scss"]
})
export class TopComponent implements OnInit {

  mode:any = "over";
  opened: boolean;
  currentLang: string;

  constructor(public service: LoadingIndicatorService) {}

  redirectUri = "";

  profile: any;

  profile_utf8: any;

  _url: any = `${window.location.origin}`;

  pictureUrl:string = "../../../assets/img/icon_who.svg";

  ngOnInit() {
    // // this.authService.profile.subscribe(p => (this.profile = p));
    // if (this.authService.getUser() !== null) {
    //   this.profile = this.authService.getUser();

    //   const iconvpipe = new IconvPipe();
    //   this.profile_utf8 = JSON.parse(
    //     iconvpipe.transform(JSON.stringify(this.profile.idToken))
    //   );
    // }
  }

  // サイトナビ開閉状態の切り替え
  onhandleSiteNav(eventData: boolean) {
    // console.log(!eventData);
    this.opened = !eventData;
  }

  toggleactive(){
    this.opened = true;
  }
}
