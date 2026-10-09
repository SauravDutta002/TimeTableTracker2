const express = require('express');
const { fetchAllData } = require('../cuims/scraper');

const router = express.Router();

// Middleware to check session token
function requireSession(sessions) {
  return (req, res, next) => {
    const token = req.headers['x-session-token'];
    if (!token || !sessions.has(token)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please login again.',
      });
    }
    req.session = sessions.get(token);
    next();
  };
}

/**
 * GET /api/refresh
 * Re-fetches all data from CUIMS using the stored session.
 */
router.get('/refresh', async (req, res) => {
  try {
    const data = await fetchAllData(req.session.cuimsSession);

    // An expired CUIMS session yields empty attendance instead of an error.
    // Don't overwrite good cached data; reply as failed so the client re-logs in.
    if (!data.attendance || !data.attendance.subjects || data.attendance.subjects.length === 0) {
      console.log('[API] /refresh got empty attendance, treating CUIMS session as expired');
      return res.status(401).json({
        success: false,
        error: 'CUIMS session expired. Please login again.',
      });
    }

    req.session.data = data; // Update cached data
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to refresh data. Session may have expired.',
    });
  }
});

/**
 * GET /api/attendance/full
 * Fetches day-wise attendance records for all subjects.
 */
router.get('/test_attendance', async (req, res) => {
  const { cuimsSession, data } = req.session;
  const subj = data.attendance.subjects[0];
  
  if (!subj) return res.send('No subject');
  
  try {
    // 1. Visit main attendance page
    await cuimsSession.get('https://students.cuchd.in/frmStudentAttendanceSummary.aspx');
    
    // 2. Fetch specific class attendance
    const targetUrl = 'https://students.cuchd.in/frmStudentCourseWiseAttendanceSummary.aspx?type=' + encodeURIComponent(subj.EncryptCode);
    const resp = await cuimsSession.get(targetUrl, {
       headers: { Referer: 'https://students.cuchd.in/frmStudentAttendanceSummary.aspx' }
    });
    
    res.json({
      url: targetUrl,
      status: resp.status,
      length: resp.data.length,
      data: resp.data.substring(0, 500)
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

router.get('/attendance/full', async (req, res) => {
  console.log('[API] /attendance/full hit!');
  try {
    const { cuimsSession, data } = req.session;
    
    if (!data || !data.attendance || !data.attendance.reportId) {
      console.log('[API] /attendance/full failed: Missing basic attendance data');
      return res.status(400).json({
        success: false,
        error: 'Basic attendance data is required before fetching full attendance.',
      });
    }
    
    console.log('[API] subjects:', data.attendance.subjects.length, 'first subject encryptCode:', data.attendance.subjects[0]?.EncryptCode);

    const { getFullAttendance } = require('../cuims/scraper');
    const fullAttendance = await getFullAttendance(
      cuimsSession,
      data.attendance.subjects,
      data.attendance.reportId,
      data.attendance.sessionId
    );

    console.log('[API] fullAttendance result length:', fullAttendance.length);
    res.json({ success: true, data: fullAttendance });
  } catch (err) {
    console.error('[API] /attendance/full error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch full attendance.',
    });
  }
});

// Hack to export token
setTimeout(() => {
  const fs = require('fs');
  const sessionsMap = require('./auth').sessions;
  if (sessionsMap && sessionsMap.size > 0) {
    const firstToken = Array.from(sessionsMap.keys())[0];
    fs.writeFileSync('token.txt', firstToken);
  }
}, 2000);

module.exports = { router, requireSession };
