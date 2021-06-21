import { Component, OnInit } from "@angular/core";
import { MenuItems } from "../../shared/menu-items/menu-items";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"]
})
export class FooterComponent implements OnInit {
  constructor(public menuItems: MenuItems) {}

  ngOnInit() {}
}
