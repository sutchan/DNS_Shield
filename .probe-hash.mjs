import { createHash } from 'node:crypto';
import { appendFileSync } from 'node:fs';
const codes = ['zh-cn','zh-tw','en','ar','cs','es','hi','id','it','nl','pl','sv','th','tr','ru','vi'];
const pattern = `^(${codes.join('|')})$`;
const s = `(function(){try{var d=document.documentElement,l=localStorage.getItem('lang')||'zh-cn';if(!/${pattern}/.test(l))l='zh-cn';d.lang=l;d.setAttribute('dir',l==='ar'?'rtl':'ltr');var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){d.classList.add('dark');}}catch(e){}})();`;
appendFileSync('.probe-hash.out', 'sha256-' + createHash('sha256').update(s).digest('base64') + '\n');
