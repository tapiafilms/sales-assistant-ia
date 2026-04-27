(function () {
  'use strict';

  var Assistant = {
    config: null,
    product: null,
    sessionId: null,
    isOpen: false,
    voiceEnabled: true,
    currentAudio: null,
    avatarState: 'idle', // idle | thinking | talking

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
      var baseUrl = self._getBaseUrl();

      var positionStyle = position === 'bottom-left'
        ? 'bottom:24px;left:24px;'
        : 'bottom:24px;right:24px;';

      var container = document.createElement('div');
      container.id = 'sales-assistant-widget';
      container.style.cssText = 'position:fixed;' + positionStyle + 'z-index:99999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';

      container.innerHTML = [
        '<div id="sa-window" style="display:none;flex-direction:column;width:320px;background:#fff;border-radius:24px;box-shadow:0 20px 60px rgba(0,0,0,0.18);overflow:hidden;margin-bottom:12px;">',

          // Header
          '<div style="background:' + color + ';padding:12px 16px;display:flex;align-items:center;gap:10px;">',
            '<div style="color:#fff;font-weight:700;font-size:15px;">' + assistantName + '</div>',
            '<div style="color:rgba(255,255,255,0.7);font-size:12px;margin-left:6px;">● En línea</div>',
            '<button id="sa-voice-btn" title="Silenciar voz" style="margin-left:auto;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:15px;cursor:pointer;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;">🔊</button>',
            '<button onclick="window.Assistant._close()" style="background:none;border:none;color:#fff;font-size:20px;cursor:pointer;opacity:0.8;line-height:1;margin-left:4px;">✕</button>',
          '</div>',

          // Avatar + burbuja
          '<div style="background:#f5f5f7;padding:20px 16px 16px;display:flex;flex-direction:column;align-items:center;gap:16px;">',

            // Avatar circular
            '<div style="position:relative;width:180px;height:180px;flex-shrink:0;">',
              '<video id="sa-avatar-idle" src="' + baseUrl + '/avatar-idle.mp4" autoplay loop muted playsinline style="width:180px;height:180px;object-fit:cover;border-radius:50%;display:block;box-shadow:0 6px 24px rgba(0,0,0,0.15);border:3px solid ' + color + ';"></video>',
              '<video id="sa-avatar-thinking" src="' + baseUrl + '/avatar-thinking.mp4" loop muted playsinline style="width:180px;height:180px;object-fit:cover;border-radius:50%;display:none;position:absolute;top:0;left:0;box-shadow:0 6px 24px rgba(0,0,0,0.15);border:3px solid ' + color + ';"></video>',
              '<video id="sa-avatar-talking" src="' + baseUrl + '/avatar-talking.mp4" loop muted playsinline style="width:180px;height:180px;object-fit:cover;border-radius:50%;display:none;position:absolute;top:0;left:0;box-shadow:0 6px 24px rgba(0,0,0,0.15);border:3px solid ' + color + ';"></video>',
            '</div>',

            // Burbuja única
            '<div id="sa-bubble" style="width:100%;min-height:52px;display:flex;align-items:center;">',
              '<div style="background:#4B9EF4;color:#fff;padding:12px 16px;border-radius:20px;border-bottom-left-radius:5px;font-size:14px;line-height:1.5;max-width:100%;word-wrap:break-word;">' + welcome + '</div>',
            '</div>',

          '</div>',

          // Producto banner
          self.product ? '<div style="background:#f0f0ff;padding:8px 14px;border-top:1px solid #e8e8f0;display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:#888;">Sobre:</span><span style="font-size:13px;font-weight:600;color:#333;">' + self.product.name + '</span><span style="font-size:13px;font-weight:700;color:' + color + ';">' + self.product.price + '</span></div>' : '',

          // Input
          '<div style="padding:12px;border-top:1px solid #eee;display:flex;gap:8px;background:#fff;">',
            '<input id="sa-input" type="text" placeholder="Escribe tu pregunta..." style="flex:1;border:1px solid #e5e7eb;border-radius:24px;padding:10px 16px;font-size:14px;outline:none;color:#333;background:#f9fafb;" />',
            '<button id="sa-send" style="background:' + color + ';color:#fff;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">➤</button>',
          '</div>',

        '</div>',

        // Toggle button
        '<div id="sa-toggle" style="width:58px;height:58px;background:' + color + ';border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.2);transition:transform 0.2s;margin-left:auto;">',
          '<span id="sa-toggle-icon" style="font-size:26px;">💬</span>',
        '</div>',
      ].join('');

      document.body.appendChild(container);

      setTimeout(function () {
        if (!self.isOpen) self._showProactive(proactive, color, positionStyle);
      }, 3000);

      document.getElementById('sa-toggle').addEventListener('click', function () { self._toggle(); });
      document.getElementById('sa-send').addEventListener('click', function () { self._send(); });
      document.getElementById('sa-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') self._send();
      });
      document.getElementById('sa-voice-btn').addEventListener('click', function () { self._toggleVoice(); });
    },

    _setAvatarState: function (state) {
      this.avatarState = state;
      var idle = document.getElementById('sa-avatar-idle');
      var thinking = document.getElementById('sa-avatar-thinking');
      var talking = document.getElementById('sa-avatar-talking');
      if (!idle) return;

      idle.style.display = 'none';
      thinking.style.display = 'none';
      talking.style.display = 'none';

      var active = state === 'thinking' ? thinking : state === 'talking' ? talking : idle;
      active.style.display = 'block';
      active.play();
    },

    _setBubble: function (text, role) {
      var bubble = document.getElementById('sa-bubble');
      if (!bubble) return;
      var isBot = role === 'bot';
      var align = isBot ? 'flex-start' : 'flex-end';
      var bg = isBot ? '#4B9EF4' : '#E5E5EA';
      var textColor = isBot ? '#fff' : '#333';
      var borderRadius = isBot
        ? 'border-radius:20px;border-bottom-left-radius:5px;'
        : 'border-radius:20px;border-bottom-right-radius:5px;';
      bubble.style.justifyContent = align;
      bubble.innerHTML = '<div style="background:' + bg + ';color:' + textColor + ';padding:12px 16px;' + borderRadius + 'font-size:14px;line-height:1.5;max-width:100%;word-wrap:break-word;">' + text + '</div>';
    },

    _setTypingBubble: function () {
      var bubble = document.getElementById('sa-bubble');
      if (!bubble) return;
      bubble.style.justifyContent = 'flex-start';
      bubble.innerHTML = '<div style="background:#E5E5EA;padding:12px 18px;border-radius:20px;border-bottom-left-radius:5px;font-size:20px;letter-spacing:3px;color:#999;">···</div>';
    },

    _showProactive: function (msg, color, positionStyle) {
      var self = this;
      var bubble = document.createElement('div');
      bubble.id = 'sa-proactive';
      bubble.style.cssText = 'position:fixed;' + positionStyle + 'z-index:99998;max-width:240px;background:#fff;padding:12px 16px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15);font-size:13px;color:#333;margin-bottom:90px;cursor:pointer;border-left:3px solid ' + color + ';';
      bubble.innerHTML = msg + '<span style="display:block;font-size:11px;color:#999;margin-top:4px;">Haz clic para responder</span>';
      document.body.appendChild(bubble);
      bubble.addEventListener('click', function () { bubble.remove(); self._toggle(); });
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
      if (this.isOpen) {
        this._setAvatarState('idle');
        setTimeout(function () { document.getElementById('sa-input').focus(); }, 100);
      }
    },

    _close: function () {
      this.isOpen = false;
      document.getElementById('sa-window').style.display = 'none';
      document.getElementById('sa-toggle-icon').textContent = '💬';
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }
    },

    _send: function () {
      var input = document.getElementById('sa-input');
      var msg = input.value.trim();
      if (!msg) return;
      input.value = '';

      this._setBubble(msg, 'user');
      this._setAvatarState('thinking');

      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      var self = this;
      var baseUrl = this._getBaseUrl();

      // Mostrar puntos tras un pequeño delay para que se vea la burbuja del usuario primero
      setTimeout(function () { self._setTypingBubble(); }, 600);

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
          var reply = data.message || 'Lo siento, ocurrió un error.';
          self._setBubble(reply, 'bot');
          if (self.voiceEnabled) {
            self._speak(reply);
          } else {
            self._setAvatarState('idle');
          }
        })
        .catch(function () {
          self._setBubble('Error de conexión. Por favor intenta de nuevo.', 'bot');
          self._setAvatarState('idle');
        });
    },

    _toggleVoice: function () {
      this.voiceEnabled = !this.voiceEnabled;
      var btn = document.getElementById('sa-voice-btn');
      if (btn) {
        btn.textContent = this.voiceEnabled ? '🔊' : '🔇';
        btn.title = this.voiceEnabled ? 'Silenciar voz' : 'Activar voz';
      }
      if (!this.voiceEnabled && this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
        this._setAvatarState('idle');
      }
    },

    _speak: function (text) {
      var self = this;
      var baseUrl = this._getBaseUrl();

      fetch(baseUrl + '/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, clientId: self.clientId }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error('TTS error');
          return res.blob();
        })
        .then(function (blob) {
          var url = URL.createObjectURL(blob);
          var audio = new Audio(url);
          self.currentAudio = audio;
          audio.addEventListener('playing', function () {
            self._setAvatarState('talking');
          });
          audio.play();
          audio.onended = function () {
            URL.revokeObjectURL(url);
            self.currentAudio = null;
            self._setAvatarState('idle');
          };
          audio.onerror = function () {
            self.currentAudio = null;
            self._setAvatarState('idle');
          };
        })
        .catch(function () {
          self._setAvatarState('idle');
        });
    },
  };

  window.Assistant = Assistant;
})();
