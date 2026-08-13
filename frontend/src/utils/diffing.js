/**
 * Compares old CUIMS data with new CUIMS data and generates notifications.
 * @param {Object} oldData 
 * @param {Object} newData 
 * @returns {Array<string>} Array of notification messages
 */
export function diffCuimsData(oldData, newData) {
  if (!oldData || !newData) return [];
  
  const notifications = [];

  // 1. Diff Attendance
  const oldSubjects = oldData.attendance?.subjects || [];
  const newSubjects = newData.attendance?.subjects || [];

  newSubjects.forEach((newSubj) => {
    // Find the corresponding subject in old data by Title or EncryptCode
    const oldSubj = oldSubjects.find(
      (s) => s.EncryptCode === newSubj.EncryptCode || s.Title === newSubj.Title
    );

    if (oldSubj) {
      const oldDelv = parseInt(oldSubj.Total_Delv) || 0;
      const oldAttd = parseInt(oldSubj.Total_Attd) || 0;
      const newDelv = parseInt(newSubj.Total_Delv) || 0;
      const newAttd = parseInt(newSubj.Total_Attd) || 0;

      const delvDiff = newDelv - oldDelv;
      const attdDiff = newAttd - oldAttd;

      if (delvDiff > 0) {
        if (attdDiff > 0) {
          notifications.push(`Attendance Updated: Marked Present in ${newSubj.Title}`);
        } else {
          notifications.push(`Attendance Updated: Marked Absent in ${newSubj.Title}`);
        }
      }
    }
  });

  // 2. Diff Marks
  const oldMarksData = oldData.marks?.data || {};
  const newMarksData = newData.marks?.data || {};

  // For each session in new marks
  Object.keys(newMarksData).forEach((sessionId) => {
    const newSubjectsMarks = newMarksData[sessionId] || [];
    const oldSubjectsMarks = oldMarksData[sessionId] || [];

    newSubjectsMarks.forEach((newSubj) => {
      const oldSubj = oldSubjectsMarks.find((s) => s.name === newSubj.name);

      if (oldSubj) {
        // Compare components
        newSubj.marks.forEach((newMark) => {
          const oldMark = oldSubj.marks.find((m) => m.element === newMark.element);
          if (!oldMark) {
            notifications.push(`Marks Uploaded: ${newSubj.name} - ${newMark.element} (${newMark.obtained}/${newMark.total})`);
          } else if (oldMark.obtained !== newMark.obtained) {
            notifications.push(`Marks Updated: ${newSubj.name} - ${newMark.element} changed from ${oldMark.obtained} to ${newMark.obtained}`);
          }
        });
      } else {
        // New subject with marks
        notifications.push(`New Marks Uploaded for ${newSubj.name}`);
      }
    });
  });

  return notifications;
}
