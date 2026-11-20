/* Legacy URL + anchor redirects for links into the old one-page stoicspartan.uk.
   Every id on the live homepage (19 Nov 2026) is mapped; targets updated for the hybrid layout (20 Nov 2026). Runs on the homepage and the 404 page only. */
(function(){
  var ANCHORS={
"home": "",
"mark": "about/#mark",
"expertise": "about/#expertise",
"ecosystem": "about/#ecosystem",
"philosophy": "about/#philosophy",
"trifecta": "#trifecta",
"pillars": "method/#pillars",
"pillars-heading": "method/#pillars",
"technical": "method/#technical",
"risk": "method/#risk",
"psychology": "method/#psychology",
"technical-mastery": "method/#technical-mastery",
"technical-mastery-heading": "method/#technical-mastery",
"development": "method/#development",
"mentorship": "mentorship/",
"service-core": "mentorship/#core",
"service-pro": "mentorship/#pro",
"service-elite": "mentorship/#elite",
"service-diagnostic": "mentorship/diagnostic/",
"service-masterclass": "mentorship/masterclass/",
"service-live": "live/",
"deeper": "#deeper",
"testimonials": "stories/#testimonials",
"faq": "faq/",
"apply": "apply/",
"application-pathway": "apply/",
"hero-title": "",
"year": "",
"academy": "academy/",
"market-psychology-guide": "academy/#market-psychology-guide",
"performance-lab": "performance-lab/",
"performance-services": "performance-lab/#performance-services",
"worked-example": "performance-lab/#worked-example",
"ai-analysis": "performance-lab/#ai-analysis",
"testimonial-john": "stories/#testimonial-john",
"testimonial-sanjeev": "stories/#testimonial-sanjeev",
"testimonial-daniel": "stories/#testimonial-daniel",
"testimonial-aamir": "stories/#testimonial-aamir",
"primary-nav": ""
};
  var PAGES={
"/index.html": "",
"/academy.html": "academy/",
"/faq.html": "faq/",
"/performance-lab.html": "performance-lab/",
"/spartan-story.html": "spartan-story/",
"/stories.html": "stories/",
"/services": "mentorship/",
"/services.html": "mentorship/",
"/apply": "apply/",
"/apply.html": "apply/",
"/contact": "contact/",
"/contact.html": "contact/",
"/method": "method/",
"/method.html": "method/",
"/meet-mark": "about/",
"/meet-mark.html": "about/",
"/about.html": "about/",
"/mentorship.html": "mentorship/",
"/live.html": "live/"
};
  var s=document.currentScript, root=(s&&s.getAttribute("data-root"))||"./";
  function go(){
    var h=decodeURIComponent((location.hash||"").slice(1)), path=location.pathname.replace(/\/+$/,"")||"/";
    var tail=path.slice(path.lastIndexOf("/"));
    if(PAGES.hasOwnProperty(tail) && !document.getElementById("hero-title")){ location.replace(root+PAGES[tail]+(h?"#"+h:"")); return; }
    if(h && ANCHORS.hasOwnProperty(h) && !document.getElementById(h)){ location.replace(root+ANCHORS[h]); }
  }
  go(); window.addEventListener("hashchange",go);
})();
