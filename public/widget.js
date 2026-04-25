(function () {
  'use strict';

  var Assistant = {
    config: null,
    product: null,
    sessionId: null,
    isOpen: false,
    voiceEnabled: true,
    messages: [],

    init: function (options) {
      if (!options.clientId) return console.error('[Assistant] clientId requerido');
      this.clientId = options.clientId;
      this.productId = options.productId || this._detectProductFromURL();
      this.sessionId = this._getOrCreateSession();
      this._loadConfig();
    },

    _detectProductFromURL: function () {
      var params = new URLSearchParams(window.location.search);
      return params.get('productId') || params.get('product_id') || null;
    },

    _getOrCreateSession: function () {
      var key = 'assistant_session_' + this.clientId;
      var existing = sessionStorage.getItem(key);
      if (existing) return existing;
      var id = 'sess_' + Math.random().toString(36).substr(2, 12);
      sessionStorage.setItem(key, id);
      return id;
    },

    _getBaseUrl: function () {
      var scripts = document.querySelectorAll('script[src*="widget.js"]');
      if (scripts.length > 0) {
        var src = scripts[scripts.length - 1].src;
        return src.replace('/widget.js', '');
      }
      return window.location.origin;
    },

    _loadConfig: function () {
      var self = this;
      var baseUrl = this._getBaseUrl();
      fetch(baseUrl + '/api/config?clientId=' + self.clientId)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.error) return console.error('[Assistant]', data.error);
          self.config = data;
          if (self.productId) {
            self._loadProduct(baseUrl);
          } else {
            self._render();
          }
        })
        .catch(function (e) { console.error('[Assistant] Error cargando config:', e); });
    },

    _loadProduct: function (baseUrl) {
      var self = this;
      fetch(baseUrl + '/api/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: self.clientId, productId: self.productId }),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          self.product = data.product || null;
          self._render();
        })
        .catch(function () { self._render(); });
    },

    _render: function () {
      var self = this;
      var cfg = self.config;
      var settings = cfg.settings || {};
      var color = settings.primary_color || '#6366f1';
      var position = settings.position || 'bottom-right';
      var assistantName = cfg.client.assistant_name || 'Asistente';
      var welcome = settings.welcome_message || '¡Hola! ¿En qué puedo ayudarte?';
      var proactive = settings.proactive_msg || '¿Tienes alguna pregunta?';

      var positionStyle = position === 'bottom-left'
        ? 'bottom:24px;left:24px;'
        : 'bottom:24px;right:24px;';

      // Contenedor principal
      var container = document.createElement('div');
      container.id = 'sales-assistant-widget';
      container.style.cssText = 'position:fixed;' + positionStyle + 'z-index:99999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';

      // Chat window
      container.innerHTML = [
        '<div id="sa-window" style="display:none;flex-direction:column;width:360px;height:500px;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,0.18);overflow:hidden;margin-bottom:12px;">',
          // Header
          '<div style="background:' + color + ';padding:16px;display:flex;align-items:center;gap:10px;">',
            '<div style="width:36px;height:36px;background:rgba(255,255,255,0.25);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;">🤖</div>',
            '<div>',
              '<div style="color:#fff;font-weight:700;font-size:15px;">' + assistantName + '</div>',
              '<div style="color:rgba(255,255,255,0.8);font-size:12px;">● En línea</div>',
            '</div>',
            '<button id="sa-voice-btn" title="Silenciar voz" style="margin-left:auto;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:16px;cursor:pointer;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;">🔊</button>',
            '<button onclick="window.Assistant._close()" style="background:none;border:none;color:#fff;font-size:20px;cursor:pointer;opacity:0.8;line-height:1;">✕</button>',
          '</div>',
          // Producto context banner
          self.product ? '<div style="background:#f8f9ff;padding:10px 14px;border-bottom:1px solid #eee;display:flex;align-items:center;gap:8px;"><span style="font-size:13px;color:#666;">Preguntando sobre:</span><span style="font-size:13px;font-weight:600;color:#333;">' + self.product.name + '</span><span style="font-size:13px;font-weight:700;color:' + color + ';">' + self.product.price + '</span></div>' : '',
          // Messages
          '<div id="sa-messages" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f9fafb;">',
            '<div class="sa-msg sa-msg-bot" style="align-self:flex-start;max-width:80%;background:#fff;padding:10px 14px;border-radius:12px;border-bottom-left-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.08);font-size:14px;color:#333;line-height:1.5;">' + welcome + '</div>',
          '</div>',
          // Input
          '<div style="padding:12px;border-top:1px solid #eee;display:flex;gap:8px;background:#fff;">',
            '<input id="sa-input" type="text" placeholder="Escribe tu pregunta..." style="flex:1;border:1px solid #e5e7eb;border-radius:24px;padding:10px 16px;font-size:14px;outline:none;color:#333;" />',
            '<button id="sa-send" style="background:' + color + ';color:#fff;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">➤</button>',
          '</div>',
        '</div>',
        // Toggle button
        '<div id="sa-toggle" style="width:58px;height:58px;background:' + color + ';border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.2);transition:transform 0.2s;margin-left:auto;">',
          '<span id="sa-toggle-icon" style="font-size:26px;">💬</span>',
        '</div>',
      ].join('');

      document.body.appendChild(container);

      // Proactive message bubble
      setTimeout(function () {
        if (!self.isOpen) self._showProactive(proactive, color, positionStyle);
      }, 3000);

      // Events
      document.getElementById('sa-toggle').addEventListener('click', function () {
        self._toggle();
      });
      document.getElementById('sa-send').addEventListener('click', function () {
        self._send();
      });
      document.getElementById('sa-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') self._send();
      });
      document.getElementById('sa-voice-btn').addEventListener('click', function () {
        self._toggleVoice();
      });
    },

    _showProactive: function (msg, color, positionStyle) {
      var self = this;
      var bubble = document.createElement('div');
      bubble.id = 'sa-proactive';
      bubble.style.cssText = 'position:fixed;' + positionStyle + 'z-index:99998;max-width:240px;background:#fff;padding:12px 16px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15);font-size:13px;color:#333;margin-bottom:90px;cursor:pointer;border-left:3px solid ' + color + ';';
      bubble.innerHTML = msg + '<span style="display:block;font-size:11px;color:#999;margin-top:4px;">Haz clic para responder</span>';
      document.body.appendChild(bubble);
      bubble.addEventListener('click', function () {
        bubble.remove();
        self._toggle();
      });
      setTimeout(function () { if (bubble.parentNode) bubble.remove(); }, 8000);
    },

    _toggle: function () {
      this.isOpen = !this.isOpen;
      var win = document.getElementById('sa-window');
      var icon = document.getElementById('sa-toggle-icon');
      var proactive = document.getElementById('sa-proactive');
      if (proactive) proactive.remove();
      win.style.display = this.isOpen ? 'flex' : 'none';
      icon.textContent = this.isOpen ? '✕' : '💬';
      if (this.isOpen) setTimeout(function () { document.getElementById('sa-input').focus(); }, 100);
    },

    _close: function () {
      this.isOpen = false;
      document.getElementById('sa-window').style.display = 'none';
      document.getElementById('sa-toggle-icon').textContent = '💬';
    },

    _send: function () {
      var input = document.getElementById('sa-input');
      var msg = input.value.trim();
      if (!msg) return;
      input.value = '';

      this._appendMessage(msg, 'user');
      this._appendTyping();

      var self = this;
      var baseUrl = this._getBaseUrl();

      fetch(baseUrl + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: self.clientId,
          productId: self.productId,
          message: msg,
          sessionId: self.sessionId,
        }),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          self._removeTyping();
          var msg = data.message || 'Lo siento, ocurrió un error.';
          self._appendMessage(msg, 'bot');
          if (self.voiceEnabled) self._speak(msg);
        })
        .catch(function () {
          self._removeTyping();
          self._appendMessage('Error de conexión. Por favor intenta de nuevo.', 'bot');
        });
    },

    _appendMessage: function (text, role) {
      var msgs = document.getElementById('sa-messages');
      var color = (this.config && this.config.settings && this.config.settings.primary_color) || '#6366f1';
      var isUser = role === 'user';
      var div = document.createElement('div');
      div.style.cssText = 'align-self:' + (isUser ? 'flex-end' : 'flex-start') + ';max-width:82%;background:' + (isUser ? color : '#fff') + ';color:' + (isUser ? '#fff' : '#333') + ';padding:10px 14px;border-radius:12px;border-' + (isUser ? 'bottom-right' : 'bottom-left') + '-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.08);font-size:14px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;';
      div.textContent = text;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    },

    _appendTyping: function () {
      var msgs = document.getElementById('sa-messages');
      var div = document.createElement('div');
      div.id = 'sa-typing';
      div.style.cssText = 'align-self:flex-start;background:#fff;padding:10px 14px;border-radius:12px;border-bottom-left-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.08);font-size:22px;letter-spacing:2px;';
      div.textContent = '···';
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    },

    _removeTyping: function () {
      var t = document.getElementById('sa-typing');
      if (t) t.remove();
    },

    _toggleVoice: function () {
      this.voiceEnabled = !this.voiceEnabled;
      var btn = document.getElementById('sa-voice-btn');
      if (btn) {
        btn.textContent = this.voiceEnabled ? '🔊' : '🔇';
        btn.title = this.voiceEnabled ? 'Silenciar voz' : 'Activar voz';
      }
    },

    _speak: function (text) {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      var utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'es-ES';
      utter.rate = 1.05;
      utter.pitch = 1;

      // Asignar voz según cliente
      var voices = window.speechSynthesis.getVoices();
      var femaleClients = ['22222222-2222-2222-2222-222222222222'];
      var preferFemale = femaleClients.indexOf(this.clientId) !== -1;
      var picked = voices.find(function (v) {
        return v.lang.startsWith('es') && (preferFemale ? v.name.match(/female|woman|sofia|lucia|paulina/i) : v.name.match(/male|man|jorge|diego|carlos/i));
      }) || voices.find(function (v) { return v.lang.startsWith('es'); });
      if (picked) utter.voice = picked;

      window.speechSynthesis.speak(utter);
    },
  };

  window.Assistant = Assistant;
})();
