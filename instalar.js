// convite para instalar o app, uma vez: some quando a pessoa instala ou dispensa
(function(){
  var CHAVE = 'instalar-visto';
  function ler(k, s){ try { return (s ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } }
  function gravar(k, s){ try { (s ? sessionStorage : localStorage).setItem(k, '1'); } catch (e) {} }

  var instalado = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (instalado || ler(CHAVE) || ler(CHAVE, true)) return;

  var ua = navigator.userAgent;
  var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var safari = ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|GSA|Instagram|FBAN|FBAV/.test(ua);

  var css = document.createElement('style');
  css.textContent =
    '.instalar{position:fixed; left:12px; right:12px; bottom:max(12px, env(safe-area-inset-bottom)); z-index:85;' +
    ' max-width:460px; margin:0 auto; display:flex; gap:12px; align-items:center; padding:12px 14px;' +
    ' background:var(--surface,#fff); color:var(--ink,#1c1a17); border:1px solid var(--rule-2,#cfcbc0);' +
    ' border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,.2); font-family:"IBM Plex Sans",Archivo,system-ui,sans-serif}' +
    '.instalar img{width:40px; height:40px; border-radius:9px; flex:none}' +
    '.instalar p{margin:0; flex:1; font-size:13px; line-height:1.45; color:var(--ink-2,#575249)}' +
    '.instalar b{display:block; color:var(--ink,#1c1a17); font-size:14px; font-weight:600}' +
    '.instalar .bts{display:flex; flex-direction:column; gap:4px; flex:none}' +
    '.instalar button{font:inherit; font-size:12.5px; border-radius:5px; padding:7px 12px; cursor:pointer; border:0}' +
    '.instalar .sim{background:var(--ink,#1c1a17); color:var(--ground,#faf9f6); font-weight:600}' +
    '.instalar .nao{background:none; color:var(--ink-3,#8c867b)}' +
    'body.oferta .busca-fab{display:none}';

  var caixa, pedido = null;
  function fechar(){
    gravar(CHAVE);
    if (caixa) caixa.remove();
    document.body.classList.remove('oferta');
  }
  function mostrar(texto, botao, acao){
    if (caixa) return;
    gravar(CHAVE, true);
    document.head.appendChild(css);
    caixa = document.createElement('div');
    caixa.className = 'instalar';
    caixa.setAttribute('role', 'dialog');
    caixa.setAttribute('aria-label', 'Instalar o app');
    caixa.innerHTML = '<img src="icones/icone-192.png" alt=""><p><b>Instale o app</b>' + texto + '</p>'
      + '<div class="bts">' + (botao ? '<button type="button" class="sim">' + botao + '</button>' : '')
      + '<button type="button" class="nao">' + (botao ? 'Agora não' : 'Entendi') + '</button></div>';
    document.body.appendChild(caixa);
    document.body.classList.add('oferta');
    caixa.querySelector('.nao').addEventListener('click', fechar);
    var s = caixa.querySelector('.sim');
    if (s) s.addEventListener('click', acao);
  }

  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    pedido = e;
    mostrar('Fica na tela inicial e abre sem internet.', 'Instalar', function(){
      pedido.prompt();
      pedido.userChoice.then(fechar, fechar);
    });
  });
  window.addEventListener('appinstalled', fechar);

  if (safari) setTimeout(function(){
    mostrar('Toque em <b style="display:inline">Compartilhar</b> e depois em <b style="display:inline">Adicionar à Tela de Início</b>. Abre sem internet.');
  }, 1500);
})();
