const cheerio = require('cheerio');
const CUIMSSession = require('./session');
const { solveCaptcha } = require('./captcha');

const BASE_URL = 'https://students.cuchd.in';
const ERROR_HEAD = 'Whoops, Something broke!';

/**
 * Login to CUIMS with auto-captcha solving.
 * Retries up to maxAttempts times if captcha is wrong.
 */
async function login(uid, password, maxAttempts = 5) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[CUIMS] Login attempt ${attempt}/${maxAttempts}...`);
      const session = new CUIMSSession();

      // Step 1: GET login page
      const loginPage = await session.get(BASE_URL + '/');
      const $ = cheerio.load(loginPage.data);

      const formData = { txtUserId: uid, btnNext: 'NEXT' };
      const vs = $('input[name="__VIEWSTATE"]').val();
      const vsg = $('input[name="__VIEWSTATEGENERATOR"]').val();
      if (vs) formData.__VIEWSTATE = vs;
      if (vsg) formData.__VIEWSTATEGENERATOR = vsg;

      // Step 2: POST UID
      const uidResponse = await session.postForm(BASE_URL + '/', formData);

      if (![301, 302, 303, 307, 308].includes(uidResponse.status)) {
        throw new Error('UID submission failed — unexpected response');
      }

      let passwordUrl = uidResponse.headers.location || uidResponse.headers['Location'];
      if (passwordUrl.startsWith('/')) passwordUrl = BASE_URL + passwordUrl;

      // Step 3: GET password page
      const passwordPage = await session.get(passwordUrl);
      const $pwd = cheerio.load(passwordPage.data);

      // Step 4: Download captcha image & solve
      const captchaSrc = $pwd('#imgCaptcha').attr('src');
      let captchaUrl = captchaSrc;
      if (!captchaUrl.startsWith('http')) {
        captchaUrl = BASE_URL + '/' + captchaUrl.replace(/^\//, '');
      }

      const captchaResp = await session.get(captchaUrl, { responseType: 'arraybuffer' });
      const captchaBuffer = Buffer.from(captchaResp.data);
      const captchaText = await solveCaptcha(captchaBuffer);
      console.log(`[CUIMS]   Captcha solved: "${captchaText}"`);

      // Step 5: POST password + captcha
      const pwdData = {
        txtLoginPassword: password,
        txtcaptcha: captchaText,
        btnLogin: 'LOGIN',
      };
      const vs2 = $pwd('input[name="__VIEWSTATE"]').val();
      const ev = $pwd('input[name="__EVENTVALIDATION"]').val();
      const vsg2 = $pwd('input[name="__VIEWSTATEGENERATOR"]').val();
      if (vs2) pwdData.__VIEWSTATE = vs2;
      if (ev) pwdData.__EVENTVALIDATION = ev;
      if (vsg2) pwdData.__VIEWSTATEGENERATOR = vsg2;

      const loginResp = await session.postForm(passwordUrl, pwdData);

      if ([301, 302, 303, 307, 308].includes(loginResp.status)) {
        let dashUrl = loginResp.headers.location || loginResp.headers['Location'];
        
        // If it redirects back to the login page, it failed
        if (dashUrl === '/' || dashUrl.toLowerCase().includes('login')) {
            const err = new Error('Incorrect UID or password');
            err.code = 'INCORRECT_CREDENTIALS';
            throw err;
        }

        if (dashUrl.startsWith('/')) dashUrl = BASE_URL + dashUrl;
        let dashResp = await session.get(dashUrl);
        
        // Bypass the "Today's Highlight" landing page to get the real menu
        if (dashResp.data.includes("Today's Highlight") || dashResp.data.includes('LandingPage.aspx')) {
            console.log('[CUIMS] Bypassing LandingPage to fetch StudentHome.aspx...');
            dashResp = await session.get(BASE_URL + '/StudentHome.aspx');
        }

        // If the resulting dashboard is actually just the login page again
        if (dashResp.data.includes('txtLoginPassword') || dashResp.data.includes('btnNext')) {
            const err = new Error('Incorrect UID or password');
            err.code = 'INCORRECT_CREDENTIALS';
            throw err;
        }

        session.dashHtml = dashResp.data; // Save dashboard HTML
        console.log('[CUIMS]   Login successful!');
        return session;
      }

      // Status 200 might mean wrong password
      if (loginResp.status === 200) {
        const htmlString = loginResp.data.toLowerCase();
        
        // If we are still on the login page (we can see the login form elements)
        const isStillLoginPage = htmlString.includes('txtloginpassword') || htmlString.includes('btnlogin') || htmlString.includes('txtuserid');

        if (isStillLoginPage) {
          if (htmlString.includes('captcha') || htmlString.includes('invalid verification code')) {
            // It's a captcha error, throw to retry
            throw new Error('Captcha incorrect');
          } else {
            const err = new Error('Incorrect UID or password');
            err.code = 'INCORRECT_CREDENTIALS';
            throw err;
          }
        }
        
        // If it's not the login page, but status is 200, it's very weird, but let's throw an error to be safe if it doesn't look like a success
        throw new Error('Unexpected 200 response on login');
      }

    } catch (err) {
      if (err.code === 'INCORRECT_CREDENTIALS') throw err;
      if (attempt === maxAttempts) {
        const error = new Error(`Login failed after ${maxAttempts} attempts: ${err.message}`);
        error.code = 'LOGIN_FAILED';
        throw error;
      }
      console.log(`[CUIMS]   Attempt ${attempt} error: ${err.message}`);
    }
  }
  
  const error = new Error(`Login failed: Exceeded maximum attempts`);
  error.code = 'LOGIN_FAILED';
  throw error;
}

/**
 * Fetch student's full name from the profile page.
 */
async function getProfile(session) {
  const url = BASE_URL + '/frmAccountStudentDetails.aspx';
  const resp = await session.get(url);

  if (resp.data.includes(ERROR_HEAD)) {
    throw new Error('UIMS internal error fetching profile');
  }

  const $ = cheerio.load(resp.data);
  const name = $('.user-n-mob').text().trim() || 'Unknown';

  return { name };
}

/**
 * Fetch attendance summary for the current session.
 * Returns: { subjects: [...], sessionId, reportId }
 */
async function getAttendance(session) {
  // Dynamically find the attendance URL from the dashboard menu
  let url = BASE_URL + '/frmStudentCourseWiseAttendanceSummary.aspx';
  if (session.dashHtml) {
    const $ = cheerio.load(session.dashHtml);
    const link = $('a[href*="frmStudentCourseWiseAttendanceSummary.aspx"]').first().attr('href');
    if (link) {
      url = link.startsWith('http') ? link : BASE_URL + '/' + link.replace(/^\//, '');
      console.log(`[CUIMS] Found dynamic attendance URL: ${url}`);
    } else {
      console.log(`[CUIMS] Warning: Could not find dynamic attendance link, falling back to default.`);
    }
  }

  const resp = await session.get(url);

  if (resp.data.includes(ERROR_HEAD)) {
    throw new Error('UIMS internal error fetching attendance');
  }

  const html = resp.data;

  // Extract report ID and session ID via robust regex
  const reportMatch = html.match(/getReport\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/i);
  const reportId = reportMatch ? reportMatch[1] : null;
  const sessionId = reportMatch ? reportMatch[2] : null;

  if (!sessionId || !reportId) {
    console.log('[CUIMS] Failed to find reportId.');
    return { subjects: [], sessionId: null, reportId: null };
  }

  // Fetch JSON attendance data
  const reportUrl =
    BASE_URL + '/frmStudentCourseWiseAttendanceSummary.aspx/GetReport';
  const jsonData = `{UID:'${reportId}',Session:'${sessionId}'}`;
  const reportResp = await session.postRaw(reportUrl, jsonData);

  const parsed = JSON.parse(reportResp.data);
  const subjects = JSON.parse(parsed.d);

  return { subjects, sessionId, reportId };
}

/**
 * Fetch day-wise attendance for each subject.
 */
async function getFullAttendance(session, subjects, reportId, sessionId) {
  const results = [];
  
  let attendanceMainUrl = BASE_URL + '/frmStudentAttendanceSummary.aspx';
  try {
    if (session.dashHtml) {
      const cheerio = require('cheerio');
      const $ = cheerio.load(session.dashHtml);
      const link = $('a[href*="frmStudentAttendanceSummary.aspx"]').first().attr('href');
      if (link) {
        attendanceMainUrl = link.startsWith('http') ? link : BASE_URL + '/' + link.replace(/^\//, '');
      }
    }
    await session.get(attendanceMainUrl);
  } catch (e) {}

  for (const subj of subjects) {
    const encryptCode = subj.EncryptCode || '';
    if (!encryptCode) {
      results.push({ title: subj.Title, records: [] });
      continue;
    }

    try {
      const pageUrl = BASE_URL + `/frmStudentCourseWiseAttendanceSummary.aspx?type=${encodeURIComponent(encryptCode)}`;
      const pageResp = await session.get(pageUrl, {
        headers: { Referer: attendanceMainUrl }
      });
      
      const cheerio = require('cheerio');
      const $page = cheerio.load(pageResp.data);
      
      // Extract hidden fields from the specific course page
      // Often ASP.NET stores these in inputs or script tags.
      let hiddenCourse = $page('input[name*="course"], input[id*="course"], input[id*="Course"]').val() || '';
      let hiddenUID = $page('input[name*="UID"], input[id*="UID"]').val() || reportId;
      let hiddenSession = $page('input[name*="Session"], input[id*="Session"]').val() || sessionId;
      
      // Sometimes they are in javascript variables
      if (!hiddenCourse) {
         const html = pageResp.data;
         const courseMatch = html.match(/course\s*:\s*['"]([^'"]+)['"]/);
         if (courseMatch) hiddenCourse = courseMatch[1];
         
         const uidMatch = html.match(/UID\s*:\s*['"]([^'"]+)['"]/);
         if (uidMatch) hiddenUID = uidMatch[1];
         
         const sessionMatch = html.match(/Session\s*:\s*['"]([^'"]+)['"]/);
         if (sessionMatch) hiddenSession = sessionMatch[1];
      }
      
      // Fallback to encryptCode if we still couldn't find it (unlikely)
      if (!hiddenCourse) hiddenCourse = encryptCode;

      const fullReportUrl = BASE_URL + '/frmStudentCourseWiseAttendanceSummary.aspx/GetFullReport';
      const payload = `{course:'${hiddenCourse}',UID:'${hiddenUID}',fromDate:'0',toDate:'0',type:'All',Session:'${hiddenSession}'}`;
      
      const resp = await session.postRaw(fullReportUrl, payload, 'application/json', {
        headers: { Referer: pageUrl }
      });
      
      const parsed = JSON.parse(resp.data);
      let dVal = parsed.d;
      
      if (dVal && typeof dVal === 'object' && typeof dVal.Result === 'string') {
        dVal = dVal.Result;
      }

      let records = [];
      if (typeof dVal === 'string') {
        try {
          records = JSON.parse(dVal);
        } catch {
          records = [];
        }
      } else if (Array.isArray(dVal)) {
        records = dVal;
      } else {
        records = dVal || [];
      }
      
      console.log(`\n=== ATTENDANCE FOR: ${subj.Title} ===`);
      if (records.length > 0) {
        records.slice(0, 5).forEach((r, idx) => {
           console.log(`  [${idx+1}] Date: ${r.AttDate}, Status: ${r.AttendanceCode === 'P' ? 'PRESENT' : 'ABSENT'}`);
        });
        console.log(`  (Showing first 5 out of ${records.length} records)`);
      } else {
        console.log(`  No records found.`);
      }
      console.log(`=====================================\n`);

      results.push({
        title: subj.Title,
        records: records,
      });
    } catch (err) {
      console.log('[CUIMS] getFullAttendance error for', subj.Title, err.message);
      results.push({ title: subj.Title, records: [] });
    }
  }

  return results;
}

/**
 * Fetch available sessions and marks for each session.
 */
async function getMarksAllSessions(session) {
  // Dynamically find the marks URL from the dashboard menu
  let marksUrl = BASE_URL + '/frmStudentMarksView.aspx';
  if (session.dashHtml) {
    const $ = cheerio.load(session.dashHtml);
    const link = $('a[href*="frmStudentMarksView.aspx"]').first().attr('href');
    if (link) {
      marksUrl = link.startsWith('http') ? link : BASE_URL + '/' + link.replace(/^\//, '');
      console.log(`[CUIMS] Found dynamic marks URL: ${marksUrl}`);
    } else {
      console.log(`[CUIMS] Warning: Could not find dynamic marks link, falling back to default.`);
    }
  }

  const resp = await session.get(marksUrl);

  if (resp.status !== 200 || resp.data.length < 500) {
    return { sessions: [], data: {} };
  }

  const $ = cheerio.load(resp.data);
  const selectTag = $(
    'select[name="ctl00$ContentPlaceHolder1$wucStudentMarksView$ddlCAndPSession"]'
  );

  if (!selectTag.length) return { sessions: [], data: {} };

  const sessions = [];
  selectTag.find('option').each((_, el) => {
    const opt = $(el);
    sessions.push({
      value: opt.attr('value'),
      name: opt.text().trim(),
      isCurrent: opt.attr('selected') !== undefined,
    });
  });

  // Fetch marks for each session
  const marksData = {};
  for (const sess of sessions) {
    try {
      // Re-fetch the marks page to get fresh VIEWSTATE
      const freshResp = await session.get(marksUrl);
      const $fresh = cheerio.load(freshResp.data);

      const formData = {
        'ctl00$ContentPlaceHolder1$wucStudentMarksView$ddlCAndPSession':
          sess.value,
      };
      const vs = $fresh('input[name="__VIEWSTATE"]').val();
      const ev = $fresh('input[name="__EVENTVALIDATION"]').val();
      if (vs) formData.__VIEWSTATE = vs;
      if (ev) formData.__EVENTVALIDATION = ev;

      const marksResp = await session.postForm(marksUrl, formData);
      const $marks = cheerio.load(marksResp.data);
      const accordion = $marks('#accordion');

      if (!accordion.length) {
        marksData[sess.value] = [];
        continue;
      }

      const subjectNames = [];
      accordion.find('h3').each((_, el) => {
        subjectNames.push($marks(el).text().trim());
      });

      const divs = accordion.children('div');
      const subjects = [];

      for (let i = 0; i < Math.min(subjectNames.length, divs.length); i++) {
        const marks = [];
        $marks(divs[i])
          .find('tbody tr')
          .each((_, tr) => {
            const tds = $marks(tr).find('td');
            if (tds.length >= 3) {
              marks.push({
                element: $marks(tds[0]).text().trim(),
                total: $marks(tds[1]).text().trim(),
                obtained: $marks(tds[2]).text().trim(),
              });
            }
          });
        subjects.push({ name: subjectNames[i], marks });
      }

      marksData[sess.value] = subjects;
    } catch {
      marksData[sess.value] = [];
    }
  }

  return { sessions, data: marksData };
}

/**
 * Fetch timetable.
 */
async function getTimetable(session) {
  const ttHtml = await session.get(BASE_URL + '/frmMyTimeTable.aspx');
  const tt$ = cheerio.load(ttHtml.data);
  
  let ttTable = tt$('#grdMain');
  let loaded$ = tt$;

  if (!ttTable.length) {
    const ttVs = tt$('input[name="__VIEWSTATE"]').val();
    if (ttVs) {
      const postData = {
        __VIEWSTATE: ttVs,
        __EVENTTARGET: 'ctl00$ContentPlaceHolder1$ReportViewer1$ctl09$Reserved_AsyncLoadTarget',
      };
      const ttRes = await session.postForm(BASE_URL + '/frmMyTimeTable.aspx', postData);
      loaded$ = cheerio.load(ttRes.data);
      ttTable = loaded$('#grdMain');
    }
  }

  if (!ttTable.length) return null;

  const mappingTable = loaded$('#ContentPlaceHolder1_gvMyTimeTableDetails');

  // Build course code → name mapping
  const courseCodes = {};
  if (mappingTable.length) {
    mappingTable.find('tr').each((_, row) => {
      const tds = loaded$(row).find('td');
      if (tds.length > 1) {
        const code = loaded$(tds[0]).text().trim();
        const name = loaded$(tds[1]).text().trim();
        courseCodes[code] = name;
      }
    });
  }

  // Parse timetable grid
  const rows = ttTable.find('tr');
  const headers = [];
  rows
    .first()
    .find('th')
    .each((_, th) => headers.push(loaded$(th).text().trim()));

  const days = headers.slice(1); // first column is time slot
  const timetable = {};

  rows.slice(1).each((_, row) => {
    const tds = loaded$(row).find('td');
    const timeSlot = loaded$(tds[0]).text().trim();

    tds.slice(1).each((dayIdx, td) => {
      const cellText = loaded$(td).text().trim();
      const day = days[dayIdx];
      if (!day) return;

      if (!timetable[day]) timetable[day] = {};
      timetable[day][timeSlot] = cellText || null;
    });
  });

  return { schedule: timetable, courseCodes, days };
}

/**
 * Fetch ALL CUIMS data in one go (used after login).
 */
async function fetchAllData(session) {
  // Phase 1: Fetch profile and attendance in parallel
  const [profile, attendanceResult] = await Promise.all([
    getProfile(session).catch(() => ({ name: 'Unknown' })),
    getAttendance(session).catch(() => ({
      subjects: [],
      sessionId: null,
      reportId: null,
    })),
  ]);

  // Phase 2: Fetch marks and timetable in parallel
  const [marks, timetable] = await Promise.all([
    getMarksAllSessions(session).catch(() => ({ sessions: [], data: {} })),
    getTimetable(session).catch(() => null),
  ]);

  return {
    profile,
    attendance: attendanceResult,
    marks,
    timetable,
  };
}

module.exports = {
  login,
  getProfile,
  getAttendance,
  getFullAttendance,
  getMarksAllSessions,
  getTimetable,
  fetchAllData,
};
