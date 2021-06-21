// ログイン
export class LoginParam {
  rjGuid: any;
  email!: string;
  name!: string;
  objectId!: string;
  idp!: string;
  picture!: string;
}

// ユーザ
export class User {
  user_id!: number;
  login_id!: string;
  object_id!: string;
  gender!: string;
  user_staff_id!: boolean;
  last_login_datetime!: string;

  // 以下、ADの項目
  // 自己紹介
  // 以下、ADの項目
  // 自己紹介
  aboutMe!: string;
  // 年代
  // 年代
  age!: number;
  // 誕生日
  // 誕生日
  birthday!: string;
  // 国名
  // 国名
  countryName!: string;
  // 国コード
  // 国コード
  country!: number;
  // ユーザ名
  // ユーザ名
  displayName!: string;
  // ユーザの名
  // ユーザの名
  givenName!: string;
  // ユーザの姓
  // ユーザの姓
  surname!: string;
  // プロフィール画像プレビューURL
  picturePreviewUrl: any;
  // プロフィール写真URL
  pictureUrl: any;
  // プロフィール写真ファイル
  pictureFile: any;
  // カバー画像プレビューURL
  coverPreviewUrl: any;
  // カバー写真URL
  coverUrl: any;
  // カバー写真ファイル
  coverFile: any;
}
