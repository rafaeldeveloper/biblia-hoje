var VERSAO = 'biblia-v20';
var ESTATICO = VERSAO + '-estatico';
var PAGINAS = VERSAO + '-paginas';

var CASCA = [
  './',
  'index.html',
  'biblia-hoje.html',
  'traducao.html',
  'comentario.html',
  'bem-aventurancas.html',
  'sal-e-luz.html',
  'a-lei.html',
  'a-raiva.html',
  'o-olhar.html',
  'manifest.webmanifest',
  'instalar.js',
  'fontes/fontes.css',
  'icones/icone-192.png',
  'icones/icone-512.png',
  'icones/icone-maskable-512.png',
  'icones/apple-touch-icon.png',
  'favicon.ico'
];

// o Pages redireciona /x.html para /x; resposta redirecionada não serve para navegação
function guardar(c, urls){
  return Promise.all(urls.map(function(u){
    return fetch(u).then(function(r){
      if (!r.ok) throw new Error(u);
      if (!r.redirected) return c.put(u, r);
      return r.blob().then(function(b){
        return c.put(u, new Response(b, { status: r.status, headers: r.headers }));
      });
    });
  }));
}

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(ESTATICO).then(function(c){
      return fetch('fontes/fontes.css').then(function(r){
        return r.text();
      }).then(function(css){
        var arquivos = (css.match(/url\(([^)]+\.woff2)\)/g) || []).map(function(u){
          return 'fontes/' + u.replace(/^url\(|\)$/g, '');
        });
        return guardar(c, CASCA.concat(arquivos));
      }).catch(function(){ return guardar(c, CASCA); });
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(chaves){
      return Promise.all(chaves.map(function(k){
        if (k !== ESTATICO && k !== PAGINAS) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  var estatico = /\.(woff2|png|ico|css|js|webmanifest)$/.test(url.pathname);

  if (estatico) {
    // cache primeiro: fonte e ícone não mudam
    e.respondWith(
      caches.match(req).then(function(hit){
        return hit || fetch(req).then(function(r){
          var copia = r.clone();
          caches.open(ESTATICO).then(function(c){ c.put(req, copia); });
          return r;
        });
      })
    );
    return;
  }

  // documento: rede primeiro, cache como rede de segurança.
  // é o que faz a edição aparecer atualizada enquanto o servidor está de pé,
  // e continuar abrindo quando ele não está.
  e.respondWith(
    fetch(req).then(function(r){
      // um redirecionamento chega sem corpo e sobrescreveria a cópia boa
      if (r.ok) {
        var copia = r.clone();
        caches.open(PAGINAS).then(function(c){ c.put(req, copia); });
      }
      return r;
    }).catch(function(){
      // a cópia da última visita antes da que veio na instalação
      return caches.open(PAGINAS).then(function(c){
        return c.match(req, { ignoreSearch: true });
      }).then(function(hit){
        return hit || caches.match(req, { ignoreSearch: true });
      }).then(function(hit){
        return hit || caches.match('index.html');
      });
    })
  );
});
