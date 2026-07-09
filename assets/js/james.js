/* James — Bushbuckridge Mall AI assistant (rule-based, runs fully in the browser) */
(function () {
  "use strict";

  var STORES = window.BBM_STORES || [];
  var CATS = window.BBM_CATS || {};

  /* ---------- widget markup ---------- */
  var root = document.createElement("div");
  root.innerHTML =
    '<div class="james-hint">Hi, I’m James \u{1F44B} Ask me anything!</div>' +
    '<button class="james-fab" aria-label="Chat with James">' +
    '<svg class="ico-chat" viewBox="0 0 24 24"><path d="M12 3C6.5 3 2 6.9 2 11.7c0 2.7 1.4 5.1 3.6 6.7-.1 1-.6 2.4-1.5 3.6 1.9-.2 3.6-1 4.7-1.8 1 .3 2.1.4 3.2.4 5.5 0 10-3.9 10-8.9S17.5 3 12 3zM7.5 13a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6zm4.5 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6zm4.5 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6z"/></svg>' +
    '<svg class="ico-close" viewBox="0 0 24 24"><path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4L12 13.4 6.4 19 5 17.6 10.6 12 5 6.4 6.4 5z"/></svg>' +
    "</button>" +
    '<div class="james-panel" role="dialog" aria-label="Chat with James">' +
    '<div class="james-head"><div class="james-avatar">J</div>' +
    "<div><h3>James</h3><p>Bushbuckridge Mall assistant · online</p></div></div>" +
    '<div class="james-body" id="james-body"></div>' +
    '<div class="james-chips" id="james-chips"></div>' +
    '<div class="james-input">' +
    '<input id="james-input" type="text" placeholder="Ask about stores, hours, leasing…" autocomplete="off">' +
    '<button id="james-send" aria-label="Send">' +
    '<svg viewBox="0 0 24 24"><path d="M3 20.5 22 12 3 3.5v6.6L15.5 12 3 13.9v6.6z"/></svg>' +
    "</button></div></div>";
  document.body.appendChild(root);

  var body = document.getElementById("james-body");
  var chipsBox = document.getElementById("james-chips");
  var input = document.getElementById("james-input");
  var fab = root.querySelector(".james-fab");
  var hint = root.querySelector(".james-hint");
  var opened = false;

  fab.addEventListener("click", function () {
    document.body.classList.toggle("james-open");
    hint.classList.add("hide");
    if (document.body.classList.contains("james-open")) {
      if (!opened) {
        opened = true;
        setTimeout(function () {
          botSay(
            "Sawubona! \u{1F44B} I’m <strong>James</strong>, your Bushbuckridge Mall assistant. I can help you find a store, check trading hours, get directions, or connect you with our leasing and exhibitions team. What can I do for you?"
          );
          setChips(defaultChips);
        }, 350);
      }
      setTimeout(function () { input.focus(); }, 400);
    }
  });

  /* ---------- chat plumbing ---------- */
  function el(cls, html) {
    var d = document.createElement("div");
    d.className = cls;
    d.innerHTML = html;
    return d;
  }
  function scroll() { body.scrollTop = body.scrollHeight; }
  function userSay(text) {
    body.appendChild(el("msg user", escapeHtml(text)));
    scroll();
  }
  function botSay(html) {
    body.appendChild(el("msg bot", html));
    scroll();
  }
  function botTyping(cb, delay) {
    var t = el("typing", "<i></i><i></i><i></i>");
    body.appendChild(t);
    scroll();
    setTimeout(function () {
      t.remove();
      cb();
    }, delay || 700 + Math.random() * 500);
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function setChips(list) {
    chipsBox.innerHTML = "";
    list.forEach(function (c) {
      var b = document.createElement("button");
      b.textContent = c;
      b.addEventListener("click", function () { handle(c); });
      chipsBox.appendChild(b);
    });
  }
  var defaultChips = ["Trading hours", "Find a store", "Directions", "Leasing", "Exhibitions", "Talk to a human"];

  function send() {
    var v = input.value.trim();
    if (!v) return;
    input.value = "";
    handle(v);
  }
  document.getElementById("james-send").addEventListener("click", send);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") send();
  });

  /* ---------- store search ---------- */
  function findStores(q) {
    q = q.toLowerCase();
    var words = q.split(/[^a-z0-9']+/).filter(function (w) { return w.length > 2; });
    var scored = [];
    STORES.forEach(function (s) {
      var name = s.name.toLowerCase();
      var score = 0;
      if (q.indexOf(name) !== -1) score += 10;
      words.forEach(function (w) {
        if (name.indexOf(w) !== -1) score += 4;
        if (CATS[s.cat] && CATS[s.cat].toLowerCase().indexOf(w) !== -1) score += 1;
      });
      if (score > 0) scored.push([score, s]);
    });
    scored.sort(function (a, b) { return b[0] - a[0]; });
    return scored.map(function (x) { return x[1]; });
  }
  function storeCard(s) {
    var out = "<strong>" + s.name + "</strong> · " + (CATS[s.cat] || "");
    var bits = [];
    if (s.shop) bits.push("Shop " + s.shop + (s.entrance ? " (Entrance " + s.entrance + ")" : ""));
    if (s.phone) bits.push('<a href="tel:' + s.phone.replace(/[^0-9+]/g, "") + '">' + s.phone + "</a>");
    bits.push(s.hours);
    return out + '<span class="store-line">' + bits.join(" · ") + "</span>";
  }

  /* ---------- intents ---------- */
  var CAT_WORDS = {
    groceries: ["grocery", "groceries", "supermarket", "food shop", "wholesale", "liquor", "meat"],
    fashion: ["clothes", "clothing", "fashion", "shoes", "jeans", "apparel", "boutique", "fabric", "sport"],
    food: ["restaurant", "eat", "food", "chicken", "pie", "takeaway", "take-away", "hungry", "lunch"],
    banking: ["bank", "atm", "loan", "cash", "insurance", "finance", "money"],
    health: ["pharmacy", "clinic", "dentist", "optometrist", "glasses", "medicine", "salon", "hair", "herbal", "health"],
    home: ["furniture", "cupboard", "paint", "hardware", "home", "bed", "build"],
    electronics: ["phone", "cellphone", "electronics", "gadget", "laptop", "repair", "sim", "airtime"],
    services: ["post", "home affairs", "sassa", "government", "transport", "petrol", "fuel", "garage", "cleaning"]
  };

  function handle(text) {
    userSay(text);
    var q = text.toLowerCase();
    botTyping(function () {
      respond(q);
    });
  }

  function respond(q) {
    /* greetings */
    if (/^(hi|hello|hey|sawubona|thobela|avuxeni|good (morning|afternoon|evening))\b/.test(q)) {
      botSay("Hello! \u{1F600} Great to see you. Ask me about <strong>stores</strong>, <strong>trading hours</strong>, <strong>directions</strong>, <strong>leasing</strong> or <strong>exhibitions</strong> — whatever you need.");
      setChips(defaultChips);
      return;
    }
    if (/thank|thanks|shukran|ngiyabonga/.test(q)) {
      botSay("You’re most welcome! Anything else I can help with? \u{1F60A}");
      setChips(defaultChips);
      return;
    }

    /* hours */
    if (/hour|open|close|time|trading/.test(q)) {
      botSay(
        "<strong>Mall trading hours</strong><br>Mon – Fri: 08:00 – 17:00<br>Sat – Sun: 08:00 – 13:00<br>Holidays: 08:00 – 13:00" +
        '<span class="store-line"><strong>Pick n Pay &amp; Shoprite</strong><br>Mon – Fri: 08:00 – 18:00<br>Weekends &amp; holidays: 08:00 – 17:00</span>'
      );
      setChips(["Find a store", "Directions", "Leasing"]);
      return;
    }

    /* "where is <store>" — store lookup wins over mall directions */
    if (/where|find|looking for|is there/.test(q)) {
      var storeHits = findStores(q);
      if (storeHits.length) {
        botSay("Found it! \u{1F389}<br><br>" + storeHits.slice(0, 3).map(storeCard).join("<br><br>"));
        setChips(["Directions", "Trading hours", "Find a store"]);
        return;
      }
    }

    /* directions / location */
    if (/where|direction|address|located|location|how (do i|to) get|map|park/.test(q)) {
      botSay(
        "We’re at the corner of the <strong>R40 and R533</strong>, Bushbuckridge CBD, 1280 — right in the heart of town, with free parking. \u{1F697}<br><br>" +
        '<a href="https://www.google.com/maps/dir//Bushbuckridge+Mall" target="_blank" rel="noopener">Open directions in Google Maps</a> or see the <a href="contact-us.html">Contact page</a>.'
      );
      setChips(["Trading hours", "Find a store"]);
      return;
    }

    /* leasing / rental */
    if (/leas|rent|retail space|open a (shop|store)|vacan|tenant/.test(q)) {
      botSay(
        "Exciting! \u{1F3EA} You can <a href=\"https://mallops.nexussolution.cloud/apply\" target=\"_blank\" rel=\"noopener\"><strong>apply for retail space online</strong></a> in about 10 minutes — the PDF form is available inside the portal too.<br><br>Questions first? Our leasing manager <strong>Lizelle Cloete</strong> is at <a href=\"mailto:lizelle@jeqe.co.za\">lizelle@jeqe.co.za</a>, and there’s more info on the <a href=\"retail-application.html\">Retail store application</a> page."
      );
      setChips(["Retail store application", "Exhibitions", "Talk to a human"]);
      return;
    }
    if (/retail store application/.test(q)) {
      botSay('You can <a href="https://mallops.nexussolution.cloud/apply" target="_blank" rel="noopener"><strong>apply online here</strong></a> in about 10 minutes. \u{1F4DD} More details (and the PDF form) are on the <a href="retail-application.html">Retail store application</a> page.');
      setChips(defaultChips);
      return;
    }

    /* exhibition */
    if (/exhibit|activation|promot|stand|stall|market/.test(q)) {
      botSay(
        "We host <strong>product activations, promotions and exhibitions</strong> in our high-traffic court areas. \u{1F3AA}<br><br>You can <a href=\"https://mallops.nexussolution.cloud/apply/exhibition\" target=\"_blank\" rel=\"noopener\"><strong>apply online here</strong></a> — the PDF form is inside the portal too. See the <a href=\"exhibition.html\">Exhibition page</a> for details, or email <a href=\"mailto:lizelle@jeqe.co.za\">lizelle@jeqe.co.za</a>."
      );
      setChips(["Leasing", "Trading hours", "Talk to a human"]);
      return;
    }

    /* events */
    if (/event|world cup|fun run|colour run|happening/.test(q)) {
      botSay(
        "⚽ We’re screening the <strong>FIFA World Cup 2026</strong> (11 June – 11 July) right here at the mall — all games, one place, with food and drink specials! We also host community events like our Colour Fun Run. Keep an eye on our <a href=\"https://web.facebook.com/bushbuckridgemall/\" target=\"_blank\" rel=\"noopener\">Facebook page</a> for dates."
      );
      setChips(defaultChips);
      return;
    }

    /* human */
    if (/human|person|manager|someone|agent|speak to|call you/.test(q)) {
      botSay(
        "Of course! Our Centre Manager is <strong>Lucky Theledi</strong>:<br><br>\u{1F4F1} <a href=\"tel:+27767470256\">+27 76 747 0256</a><br>✉️ <a href=\"mailto:Luckyt@jeqe.co.za\">Luckyt@jeqe.co.za</a><br><br>For leasing, contact <strong>Lizelle Cloete</strong> at <a href=\"mailto:lizelle@jeqe.co.za\">lizelle@jeqe.co.za</a>."
      );
      setChips(defaultChips);
      return;
    }

    /* find a store generic */
    if (/^find a store$|what stores|which (stores|shops)|store list|directory|list of/.test(q)) {
      botSay(
        "We’re home to <strong>" + STORES.length + "+ stores</strong> — from Pick n Pay and Shoprite to fashion, banking and more. \u{1F6CD}️<br><br>Try asking me e.g. <em>“Where is Pick n Pay?”</em> or <em>“Is there a pharmacy?”</em>, or browse the full <a href=\"stores.html\">Store directory</a>."
      );
      setChips(["Where is Pick n Pay?", "Is there a pharmacy?", "Restaurants", "Banks & ATMs"]);
      return;
    }
    if (/banks? (&|and) atms?|^banks?$|^atms?$/.test(q)) {
      listCategory("banking");
      return;
    }
    if (/^restaurants?$/.test(q)) {
      listCategory("food");
      return;
    }

    /* name match against directory */
    var hits = findStores(q);
    if (hits.length) {
      var top = hits.slice(0, 3);
      botSay(
        (hits.length === 1 ? "Found it! \u{1F389}" : "Here’s what I found:") +
        "<br><br>" + top.map(storeCard).join("<br><br>") +
        (hits.length > 3 ? '<br><br>…and more in the <a href="stores.html">Store directory</a>.' : "")
      );
      setChips(["Directions", "Trading hours", "Find a store"]);
      return;
    }

    /* category keywords */
    for (var cat in CAT_WORDS) {
      for (var i = 0; i < CAT_WORDS[cat].length; i++) {
        if (q.indexOf(CAT_WORDS[cat][i]) !== -1) {
          listCategory(cat);
          return;
        }
      }
    }

    /* fallback */
    botSay(
      "Hmm, I’m not 100% sure about that one. \u{1F914} I’m best at <strong>stores</strong>, <strong>trading hours</strong>, <strong>directions</strong>, <strong>leasing</strong> and <strong>exhibitions</strong>.<br><br>For anything else, our Centre Manager <strong>Lucky Theledi</strong> can help: <a href=\"mailto:Luckyt@jeqe.co.za\">Luckyt@jeqe.co.za</a>."
    );
    setChips(defaultChips);
  }

  function listCategory(cat) {
    var list = STORES.filter(function (s) { return s.cat === cat; });
    var top = list.slice(0, 5);
    botSay(
      "<strong>" + (CATS[cat] || cat) + "</strong> at Bushbuckridge Mall:<br><br>" +
      top.map(function (s) {
        return "• " + s.name + (s.shop ? " (Shop " + s.shop + ")" : "");
      }).join("<br>") +
      (list.length > top.length ? "<br>…plus " + (list.length - top.length) + " more" : "") +
      '<br><br>Full details in the <a href="stores.html?cat=' + cat + '">Store directory</a>.'
    );
    setChips(["Trading hours", "Directions", "Find a store"]);
  }
})();
