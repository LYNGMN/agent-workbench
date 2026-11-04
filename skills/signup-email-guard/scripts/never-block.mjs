// Mailbox providers ordinary people use. None of them may ever appear in a block list: refresh.mjs and
// build-module.mjs both refuse to write one that does, and a service test should assert the same.
export const NEVER_BLOCK = Object.freeze(['gmail.com', 'googlemail.com', 'naver.com', 'daum.net', 'hanmail.net', 'kakao.com', 'nate.com',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com', 'yahoo.com', 'yahoo.co.jp',
  'proton.me', 'protonmail.com', 'pm.me', 'fastmail.com', 'zoho.com', 'gmx.de', 'gmx.net', 'web.de', 'mail.ru', 'yandex.ru',
  'qq.com', '163.com', '126.com', 'aol.com', 'tutanota.com', 'tuta.io', 'hey.com']);
