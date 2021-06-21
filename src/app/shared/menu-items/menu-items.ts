import { Injectable } from "@angular/core";

export interface BadgeItem {
  type: string;
  value: string;
}
export interface Saperator {
  name: string;
  type?: string;
}
export interface ChildrenItems {
  state: string;
  name: string;
  type?: string;
}

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon?: string;
  badge?: BadgeItem[];
  saperator?: Saperator[];
  children?: ChildrenItems[];
  isAuth?: any;
}

const NAVITEMS = [
  {
    state: "/",
    name: "ログイン",
    type: "login",
    icon: "",
    isAuth: false
  },
  {
    state: "/",
    name: "新規アカウント作成",
    type: "link",
    icon: "",
    isAuth: false
  },
  {
    state: "/",
    name: "Welcome",
    type: "link",
    icon: "",
    isAuth: true
  },
  {
    state: "logout()",
    name: "ログアウト",
    type: "logout",
    icon: "",
    isAuth: true
  },
  {
    state: "",
    name: "",
    type: "divider",
    isAuth: null
  },
  {
    state: "/",
    name: "スポット一覧",
    type: "link",
    icon: "",
    isAuth: true
  },
  {
    state: "/",
    name: "スポット詳細",
    type: "link",
    icon: "",
    isAuth: true
  },
  {
    state: "/",
    name: "エリア・特集",
    type: "link",
    icon: "",
    isAuth: true
  },
  {
    state: "",
    name: "",
    type: "divider",
    isAuth: true
  },
  {
    state: "/",
    name: "ご利用ガイド",
    type: "link",
    icon: "",
    isAuth: null
  },
  {
    state: "/",
    name: "よくあるご質問",
    type: "link",
    icon: "",
    isAuth: null
  },
  {
    state: "/",
    name: "個人情報保護方針",
    type: "link",
    icon: "",
    isAuth: null
  },
  {
    state: "/",
    name: "会社案内",
    type: "link",
    icon: "",
    isAuth: null
  }
];

const MENUITEMS = [
  {
    state: "/",
    name: "Remojuトップ",
    type: "link",
    icon: ""
  },
  {
    state: "/",
    name: "ご利用ガイド",
    type: "link",
    icon: ""
  },
  {
    state: "/",
    name: "新規アカウント作成",
    type: "link",
    icon: ""
  },
  {
    state: "/",
    name: "エリア・特集",
    type: "link",
    icon: ""
  },
  {
    state: "/",
    name: "旅プランの作成",
    type: "link",
    icon: ""
  },
  {
    state: "/",
    name: "マイページ",
    type: "link",
    icon: ""
  },
  {
    state: "/",
    name: "ログイン",
    type: "link",
    icon: ""
  }
];

const PUBLICATIONMENU = [
  {
    state: "/",
    name: "掲載希望の企業様",
    type: "link",
    icon: ""
  },
  {
    state: "/",
    name: "お知らせ",
    type: "link",
    icon: ""
  },
  {
    state: "/",
    name: "ご利用契約",
    type: "link",
    icon: ""
  },
  {
    state: "/",
    name: "プライバシーポリシー",
    type: "link",
    icon: ""
  },
  {
    state: "/",
    name: "運営会社",
    type: "link",
    icon: ""
  },
  {
    state: "/",
    name: "お問い合わせ",
    type: "link",
    icon: ""
  }
];

@Injectable()
export class MenuItems {
  getNavitem(): Menu[] {
    return NAVITEMS;
  }

  getMenuitem(): Menu[] {
    return MENUITEMS;
  }

  getPubmenuitem(): Menu[] {
    return PUBLICATIONMENU;
  }
}
