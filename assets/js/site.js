/* Stoic Spartan site script. The only network request is the application form's POST to FormSubmit. */
(function(){
  "use strict";
  var header=document.querySelector(".site-header");
  function onScroll(){ if(header){ header.classList.toggle("scrolled", window.scrollY>12); } }
  window.addEventListener("scroll",onScroll,{passive:true}); onScroll();

  /* Mobile menu */
  var toggle=document.querySelector(".menu-toggle"), menu=document.getElementById("mobile-menu");
  function setMenu(open){
    if(!toggle||!menu) return;
    toggle.setAttribute("aria-expanded",open?"true":"false");
    toggle.setAttribute("aria-label",open?"Close menu":"Open menu");
    if(open){ var r=header.getBoundingClientRect(); menu.style.setProperty("--menu-top",Math.max(0,r.bottom)+"px"); }
    menu.classList.toggle("open",open); document.body.classList.toggle("menu-open",open);
    if(open){ var f=menu.querySelector("a"); if(f) f.focus(); }
  }
  if(toggle){
    toggle.addEventListener("click",function(){ setMenu(toggle.getAttribute("aria-expanded")!=="true"); });
    document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&toggle.getAttribute("aria-expanded")==="true"){ setMenu(false); toggle.focus(); } });
    menu.addEventListener("click",function(e){ if(e.target.closest("a")) setMenu(false); });
    window.addEventListener("resize",function(){ if(window.innerWidth>1100) setMenu(false); });
  }

  /* Stage → doorway helper */
  document.querySelectorAll("[data-helper]").forEach(function(h){
    var tabs=h.querySelectorAll('[role="tab"]'), panels=h.querySelectorAll('[role="tabpanel"]');
    function select(i,focus){
      tabs.forEach(function(t,j){ t.setAttribute("aria-selected",j===i?"true":"false"); t.tabIndex=j===i?0:-1; });
      panels.forEach(function(p,j){ p.hidden=j!==i; });
      if(focus) tabs[i].focus();
    }
    tabs.forEach(function(t,i){
      t.addEventListener("click",function(){ select(i); });
      t.addEventListener("keydown",function(e){
        var k=e.key, n=tabs.length;
        if(k==="ArrowDown"||k==="ArrowRight"){ e.preventDefault(); select((i+1)%n,true); }
        if(k==="ArrowUp"||k==="ArrowLeft"){ e.preventDefault(); select((i-1+n)%n,true); }
      });
    });
    select(0);
  });

  /* Stories filter */
  var chips=document.querySelectorAll("[data-filter]");
  if(chips.length){
    chips.forEach(function(c){
      c.addEventListener("click",function(){
        var f=c.getAttribute("data-filter");
        chips.forEach(function(x){ x.setAttribute("aria-pressed",x===c?"true":"false"); });
        document.querySelectorAll("[data-service]").forEach(function(el){
          el.setAttribute("data-hidden", (f==="all"||el.getAttribute("data-service")===f)?"false":"true");
        });
        var count=document.querySelectorAll('[data-service]:not([data-hidden="true"])').length;
        var live=document.getElementById("filter-status"); if(live) live.textContent=count+" "+(count===1?"story":"stories")+" shown";
      });
    });
  }

  /* Application form: one step. Validates client-side, then a real POST to FormSubmit (which redirects to _next). */
  var form=document.getElementById("apply-form");
  if(!form) return;
  var KEY="ss-hybrid-application";
  var submit=form.querySelector(".submit");
  var EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function fields(){ return [].slice.call(form.querySelectorAll(".field[data-required]")); }
  function check(f){
    var inp=f.querySelector("input,select,textarea"), type=f.getAttribute("data-required"), bad;
    if(type==="check") bad=!inp.checked;
    else if(type==="email") bad=!EMAIL.test(inp.value.trim());
    else bad=!inp.value.trim();
    f.classList.toggle("invalid",bad); inp.setAttribute("aria-invalid",bad?"true":"false");
    return !bad;
  }
  function save(){
    var d={}; ["name","email","pathway","goal","message"].forEach(function(n){ var el=form.elements[n]; if(el) d[n]=el.value; });
    try{ localStorage.setItem(KEY,JSON.stringify(d)); }catch(e){}
  }
  try{ var saved=JSON.parse(localStorage.getItem(KEY)||"null"); if(saved){ Object.keys(saved).forEach(function(n){ var el=form.elements[n]; if(el&&saved[n]) el.value=saved[n]; }); } }catch(e){}
  /* ?pathway=core|pro|elite|diagnostic|masterclass|live|help pre-selects the pathway */
  var q=(new URLSearchParams(window.location.search).get("pathway")||"").replace(/[^a-z]/g,"");
  if(q){ var sel=form.elements.pathway, opt=sel&&sel.querySelector('option[data-key="'+q+'"]');
    if(opt){ sel.value=opt.value; var pn=document.getElementById("pathway-preselected"); if(pn) pn.hidden=false; } }
  form.addEventListener("input",function(e){ var f=e.target.closest(".field"); if(f&&f.classList.contains("invalid")) check(f); save(); });
  form.addEventListener("change",function(e){ var f=e.target.closest(".field"); if(f&&f.classList.contains("invalid")) check(f); save(); });
  form.addEventListener("submit",function(e){
    e.preventDefault();
    var first=null;
    fields().forEach(function(f){ if(!check(f)&&!first) first=f; });
    if(first){ var i=first.querySelector("input,select,textarea"); if(i) i.focus(); return; }
    var ack=form.querySelector('input[name="risk_acknowledgement"]'); if(ack){ ack.value="Confirmed: education and coaching, not signals; no guaranteed profits, funding or payouts"; }
    try{ sessionStorage.setItem("ss-applicant-name",(form.elements.name.value||"").trim().split(" ")[0]); localStorage.removeItem(KEY); }catch(err){}
    submit.disabled=true; submit.textContent="Sending…";
    HTMLFormElement.prototype.submit.call(form);
  });
})();

/* Thank-you personalisation */
(function(){
  var el=document.getElementById("ty-name"); if(!el) return;
  try{ var n=sessionStorage.getItem("ss-applicant-name"); if(n){ el.textContent=", "+n; } }catch(e){}
})();

/* v2: testimonial carousel (verbatim quotes from the live site) */
(function(){
  var root=document.querySelector(".quote-carousel"); if(!root) return;
  var slides=[].slice.call(root.querySelectorAll(".quote-slide")); if(!slides.length) return;
  var btns=root.querySelectorAll(".quote-controls button"), count=root.querySelector(".quote-count");
  var i=0, timer=null, paused=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.setAttribute("aria-roledescription","carousel");
  function show(n){ i=(n+slides.length)%slides.length; slides.forEach(function(s,j){ s.classList.toggle("is-active",j===i); s.setAttribute("aria-hidden",j===i?"false":"true"); }); if(count) count.textContent=(i+1)+" / "+slides.length; }
  function play(){ clearInterval(timer); if(!paused) timer=setInterval(function(){ show(i+1); },7000); }
  if(btns.length>=3){
    btns[0].setAttribute("aria-label","Previous quote"); btns[btns.length-1].setAttribute("aria-label","Next quote");
    btns[0].addEventListener("click",function(){ show(i-1); play(); });
    btns[btns.length-1].addEventListener("click",function(){ show(i+1); play(); });
    btns[1].addEventListener("click",function(){ paused=!paused; btns[1].textContent=paused?"Play":"Pause"; play(); });
    if(paused) btns[1].textContent="Play";
  }
  root.addEventListener("mouseenter",function(){ clearInterval(timer); }); root.addEventListener("mouseleave",play);
  show(0); play();
})();

/* v2: open a <details> when it (or something inside it) is the link target */
(function(){
  function openTarget(){ if(!location.hash) return; var el=null; try{ el=document.querySelector(location.hash); }catch(e){} if(!el) return;
    var d=el.tagName==="DETAILS"?el:el.closest("details"); if(d){ d.open=true; setTimeout(function(){ el.scrollIntoView({block:"start"}); },30); } }
  window.addEventListener("hashchange",openTarget); openTarget();

  /* Lightbox for resource thumbnails (without JS the link simply opens the full-size image) */
  var lbLinks=document.querySelectorAll("a[data-lightbox]");
  if(lbLinks.length){
    var lb=null, lbImg, lbCap, lbOpen, lbClose, lbReturn=null;
    var buildLb=function(){
      lb=document.createElement("div"); lb.className="lb"; lb.hidden=true;
      lb.setAttribute("role","dialog"); lb.setAttribute("aria-modal","true"); lb.setAttribute("aria-labelledby","lb-cap");
      lb.innerHTML='<button type="button" class="lb-close" aria-label="Close enlarged image">&times;</button><img alt=""><div class="lb-bar"><p class="lb-cap" id="lb-cap"></p><a class="lb-open" target="_blank" rel="noopener">Open full size in a new tab &#8599;</a></div>';
      document.body.appendChild(lb);
      lbImg=lb.querySelector("img"); lbCap=lb.querySelector(".lb-cap"); lbOpen=lb.querySelector(".lb-open"); lbClose=lb.querySelector(".lb-close");
      lbClose.addEventListener("click",closeLb);
      lb.addEventListener("click",function(e){ if(e.target===lb||e.target.classList.contains("lb-bar")) closeLb(); });
      lb.addEventListener("keydown",function(e){
        if(e.key==="Escape"){ e.preventDefault(); closeLb(); return; }
        if(e.key==="Tab"){ var f=[lbClose,lbOpen], i=f.indexOf(document.activeElement);
          e.preventDefault(); f[i<0?0:(i+(e.shiftKey?f.length-1:1))%f.length].focus(); }
      });
    };
    var openLb=function(a){
      if(!lb) buildLb();
      var img=a.querySelector("img");
      lbImg.src=a.getAttribute("href"); lbImg.alt=img?img.alt:"";
      var tmp=document.createElement("span"); tmp.innerHTML=a.getAttribute("data-caption")||""; lbCap.textContent=tmp.textContent;
      lbOpen.href=a.getAttribute("href"); lbReturn=a;
      lb.hidden=false; document.documentElement.classList.add("lb-lock"); lbClose.focus();
    };
    var closeLb=function(){
      if(!lb||lb.hidden) return;
      lb.hidden=true; document.documentElement.classList.remove("lb-lock");
      if(lbReturn) lbReturn.focus();
    };
    Array.prototype.forEach.call(lbLinks,function(a){
      a.addEventListener("click",function(e){ if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button===1) return; e.preventDefault(); openLb(a); });
    });
  }
})();


