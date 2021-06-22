import { Component, OnInit, Input } from "@angular/core";
import {
  trigger,
  state,
  style,
  animate,
  transition,
  stagger,
  query,
  keyframes
} from "@angular/animations";

export const MYPLANS = [
  { id: 1, category: "sightseeing", settime: 0 },
  { id: 2, category: "shopping", settime: 0 },
  { id: 3, category: "experience", settime: 0 },
  { id: 4, category: "meal", settime: 0 },
  { id: 5, category: "lodging", settime: 0 }
];

export const PLANSTATUS = [
  {
    id: 0,
    status: "init",
    title: "オリジナルの旅プランを作ろう",
    message: "プランを作成しましょう",
    time: "0"
  },
  {
    id: 1,
    status: "progress",
    title: "旅プラン作成中",
    message: "あと1つで1日完成",
    time: "4時間15分"
  },
  {
    id: 2,
    status: "complate",
    title: "旅プラン完成",
    message: "1日完成",
    time: "6時間50分"
  }
];

@Component({
  selector: "app-plan-panel",
  templateUrl: "./plan-panel.component.html",
  styleUrls: ["./plan-panel.component.scss"],
  animations: [
    trigger("EnterLeave", [
      state("flyIn", style({ transform: "translateX(0)" })),
      transition(":enter", [
        style({ transform: "translateX(-100%)" }),
        animate("0.5s 300ms ease-in")
        // query("list", [
        //   style({ opacity: 0, transform: "translateY(-100px)" }),
        //   stagger(-30, [
        //     animate(
        //       "500ms cubic-bezier(0.35, 0, 0.25, 1)",
        //       style({ opacity: 1, transform: "none" })
        //     )
        //   ])
        // ])
      ]),
      transition(":leave", [
        animate("0.3s ease-out", style({ transform: "translateX(100%)" }))
      ])
    ]),
    trigger("fadeInOut", [
      state(
        "void",
        style({
          opacity: 0
        })
      ),
      transition("void <=> *", animate(1000))
    ]),
    // ex, https://stackblitz.com/edit/angular-bwrjmf
    // Trigger animation cards array
    trigger("cardAnimation", [
      // Transition from any state to any state
      transition("* => *", [
        // Initially the all cards are not visible
        query(":enter", style({ opacity: 0 }), { optional: true }),

        // Each card will appear sequentially with the delay of 300ms
        query(
          ":enter",
          stagger("300ms", [
            animate(
              ".5s ease-in",
              keyframes([
                style({ opacity: 0, transform: "translateX(-50%)", offset: 0 }),
                style({
                  opacity: 0.5,
                  transform: "translateX(-10px) scale(1.1)",
                  offset: 0.3
                }),
                style({ opacity: 1, transform: "translateX(0)", offset: 1 })
              ])
            )
          ]),
          { optional: true }
        ),

        // Cards will disappear sequentially with the delay of 300ms
        query(
          ":leave",
          stagger("300ms", [
            animate(
              "500ms ease-out",
              keyframes([
                style({ opacity: 1, transform: "scale(1.1)", offset: 0 }),
                style({ opacity: 0.5, transform: "scale(.5)", offset: 0.3 }),
                style({ opacity: 0, transform: "scale(0)", offset: 1 })
              ])
            )
          ]),
          { optional: true }
        )
      ])
    ]),

    // Trigger animation for plus button
    trigger("plusAnimation", [
      // Transition from any state to any state
      transition("* => *", [
        query(
          ".plus-card",
          style({ opacity: 0, transform: "translateY(-40px)" })
        ),
        query(
          ".plus-card",
          stagger("500ms", [
            animate(
              "300ms 1.1s ease-out",
              style({ opacity: 1, transform: "translateX(0)" })
            )
          ])
        )
      ])
    ])
  ]
})
export class PlanPanelComponent implements OnInit {
  
  _plans: { id: number; category: string; settime: number; }[];
  _status: any;
  get plans() {
    return this._plans;
  }

  get status() {
    return this._status;
  }
  constructor() {}

  ngOnInit() {
    this._plans = MYPLANS;
    this._status = PLANSTATUS[1];

    // console.log(this._status);
    // console.log(this.planpanel_isshow);
    // this.planpanel_isshow = true;
    // console.log(this.pp_isshow_next);
  }

  addCard() {
    // this.cards.push('Card ' + (++this.index));
  }

  deleteCard() {
    // this.cards.splice(i, 1);
  }
}
