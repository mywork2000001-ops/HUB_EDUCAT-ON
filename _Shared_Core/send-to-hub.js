/* EduHub result reporter — _Shared_Core/send-to-hub.js
   Monkey-patches showResults() (P002) so scores are sent to /api/results.
   Include this AFTER all other scripts at the bottom of <body>.
   No dependencies. Fails silently. */
(function () {
  var HUB_URL  = (window.EDUHUB_URL || 'https://hub-educat-on.vercel.app') + '/api/results';
  var PLATFORM = window.EDUHUB_PLATFORM || 'P002';
  var START_AT = new Date().toISOString();

  function post(correct, total, lessonTitle) {
    try {
      var pct  = Math.round((correct / total) * 100);
      var name = localStorage.getItem('eduhub_student_name')
               || localStorage.getItem('dim_student_name')
               || 'Şagird';
      var cls  = localStorage.getItem('eduhub_student_class')
               || localStorage.getItem('dim_student_class')
               || '';
      fetch(HUB_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name:  name,
          student_class: cls,
          platform:      PLATFORM,
          lesson_id:     window.EDUHUB_LESSON_ID || '',
          lesson_title:  lessonTitle || document.title || '',
          score:         correct,
          total:         total,
          percent:       pct,
          answers:       {},
          started_at:    START_AT,
          finished_at:   new Date().toISOString(),
        }),
      }).catch(function () {});
    } catch (e) {}
  }

  /* P002: showResults(correct, total, elapsed, mode) */
  var _sr = window.showResults;
  if (typeof _sr === 'function') {
    window.showResults = function (correct, total, elapsed, mode) {
      _sr.apply(this, arguments);
      post(correct, total, document.title);
    };
  }

  /* P003: showResult() — reads correct/QS.length from DOM after render */
  var _sr2 = window.showResult;
  if (typeof _sr2 === 'function') {
    window.showResult = function () {
      _sr2.apply(this, arguments);
      setTimeout(function () {
        try {
          var sub = document.getElementById('resSub');
          if (sub) {
            var m = sub.textContent.match(/(\d+)\s*\/\s*(\d+)/);
            if (m) post(parseInt(m[1], 10), parseInt(m[2], 10), document.title);
          }
        } catch (e) {}
      }, 200);
    };
  }
})();
