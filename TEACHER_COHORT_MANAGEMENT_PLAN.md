# Teacher/Cohort Management System - Implementation Plan

## Overview
Add teacher/cohort management functionality to allow school teachers to track their students' progress through the Code the Future course, while course creators (tutors) can view all cohorts globally.

---

## Current System Analysis

### Existing Database Structure
```
Firebase Realtime Database:
├── cohorts/
│   └── {cohortId}/
│       ├── code: "cohortCode"
│       └── sessionReleaseDates: { session1: timestamp, session2: timestamp, ... }
└── users/
    └── {userId}/
        ├── displayName: "string"
        ├── email: "string"
        ├── cohort: "cohortCode"
        ├── tutor: boolean (optional, for course creators)
        ├── availability: {} (for tutors)
        ├── bookedSessions: {} (for tutors)
        └── requestedSessions: {} (for tutors)
```

### Current Authentication Flow
- Users register with email/password and a cohortCode
- Special cohortCode `cTfTut0rCod3!1` grants `tutor: true` flag
- Tutors see "Tutor Availability" menu item
- Students see their cohort members on cohort.html page
- Session unlocking is controlled by cohort.sessionReleaseDates

### Current Progress Tracking
- **None currently implemented** - this is a new feature
- Sessions are unlocked based on release dates
- No tracking of which sessions/lessons students have completed

---

## Proposed Solution

### 1. Database Schema Changes

#### Option A: Store Teacher ID in Cohorts (Recommended)
```
cohorts/
└── {cohortId}/
    ├── code: "cohortCode"
    ├── teacherId: "userId" (NEW - links to users table)
    ├── teacherName: "Display Name" (NEW - for quick display)
    └── sessionReleaseDates: { ... }

users/
└── {userId}/
    ├── displayName: "string"
    ├── email: "string"
    ├── cohort: "cohortCode"
    ├── teacher: boolean (NEW - identifies school teachers)
    ├── tutor: boolean (existing - identifies course creators)
    └── progress: { (NEW - tracks student progress)
        ├── session1: { completed: boolean, completedDate: timestamp }
        ├── session2: { completed: boolean, completedDate: timestamp }
        ├── session3: { completed: boolean, completedDate: timestamp }
        ├── session4: { completed: boolean, completedDate: timestamp }
        ├── session5: { completed: boolean, completedDate: timestamp }
        ├── session6: { completed: boolean, completedDate: timestamp }
        └── session7: { completed: boolean, completedDate: timestamp }
    }
```

**Advantages:**
- Simple one-to-many relationship (one teacher, many cohorts)
- Easy to query: "Get all cohorts where teacherId = currentUser"
- Easy to query: "Get teacher info for this cohort"
- Minimal data duplication

#### Option B: Store Cohort IDs in Users (Alternative)
```
users/
└── {userId}/
    ├── teacher: boolean
    ├── managedCohorts: ["cohortCode1", "cohortCode2"] (NEW)
    └── ...
```

**Disadvantages:**
- Requires updating user record when cohorts are added/removed
- Harder to query "who is the teacher for this cohort?"

**Recommendation: Use Option A**

---

### 2. Progress Tracking System

#### How Progress Will Be Tracked
Students will mark sessions as complete by clicking a "Mark as Complete" button on each session introduction page. This gives students control over their learning pace.

#### Progress Data Structure
```javascript
users/{userId}/progress: {
  session1: {
    completed: true,
    completedDate: 1234567890000,
    lastAccessed: 1234567890000
  },
  session2: {
    completed: false,
    lastAccessed: 1234567890000
  }
  // ... sessions 3-7
}
```

#### Progress Calculation
- **Sessions Completed**: Count of sessions where `completed: true`
- **Total Sessions**: 7 (sessions 1-7)
- **Progress Percentage**: `(completed / total) * 100`
- **Status**: 
  - "Not Started" - no lastAccessed dates
  - "In Progress" - has lastAccessed but not all completed
  - "Completed" - all 7 sessions completed

---

### 3. User Interface Design

#### A. Teacher Cohort View Page (`teacherCohortView.html`)

**Access Control:**
- Only users with `teacher: true` flag can access
- Redirect to login if not authenticated
- Show error if user is not a teacher

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Navigation Bar (standard CTF navbar)                    │
├─────────────────────────────────────────────────────────┤
│ My Cohorts                                              │
│                                                         │
│ [Dropdown: Select Cohort ▼] (if multiple cohorts)      │
│                                                         │
│ Cohort: Spring 2026 Batch A                            │
│ Students: 24 | Avg Progress: 67%                       │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Search: [____________] 🔍                        │   │
│ │ Filter: [All ▼] [Sort by: Name ▼]               │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Student Name    │ Progress │ Status │ Last Active│   │
│ ├─────────────────────────────────────────────────┤   │
│ │ Alice Johnson   │ ████████░ 7/7 │ ✓ Complete │ 2d ago │
│ │ Bob Smith       │ ████░░░░░ 4/7 │ In Progress│ 1d ago │
│ │ Carol Davis     │ ██░░░░░░░ 2/7 │ In Progress│ 5d ago │
│ │ David Lee       │ ░░░░░░░░░ 0/7 │ Not Started│ Never  │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [Export to CSV] [Email Students]                       │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Cohort selector dropdown (only if teacher manages multiple cohorts)
- Student list with progress bars
- Search/filter functionality
- Sort by name, progress, or last active
- Click student name to view detailed progress
- Export functionality for reporting

#### B. Admin/Tutor Global View Page (`adminCohortView.html`)

**Access Control:**
- Only users with `tutor: true` flag can access
- Course creators see ALL cohorts across all teachers

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Navigation Bar (standard CTF navbar)                    │
├─────────────────────────────────────────────────────────┤
│ All Cohorts - Admin View                               │
│                                                         │
│ Total Cohorts: 12 | Total Students: 287 | Avg: 54%    │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Search: [____________] 🔍                        │   │
│ │ Filter: [All Teachers ▼] [All Statuses ▼]       │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Cohort Name │ Teacher │ Students │ Avg Progress │   │
│ ├─────────────────────────────────────────────────┤   │
│ │ Spring 2026 A│ Ms. Johnson│ 24 │ ████████░ 67% │   │
│ │ Spring 2026 B│ Mr. Smith  │ 28 │ ██████░░░ 54% │   │
│ │ Winter 2026  │ Dr. Lee    │ 18 │ ████░░░░░ 42% │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [View Details] → Shows student list for selected cohort│
└─────────────────────────────────────────────────────────┘
```

**Features:**
- View all cohorts across all teachers
- Aggregate statistics
- Drill down into specific cohorts
- Filter by teacher or progress status
- Export global reports

#### C. Student Detail Modal/Page

**Triggered by:** Clicking student name in teacher/admin view

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Student Progress: Alice Johnson                         │
│ Email: alice.johnson@email.com                          │
│ Cohort: Spring 2026 Batch A                            │
│                                                         │
│ Overall Progress: 7/7 Sessions (100%)                   │
│ ████████████████████████████████████████████ 100%      │
│                                                         │
│ Session Details:                                        │
│ ┌─────────────────────────────────────────────────┐   │
│ │ ✓ Session 1: Dev Environment    │ Completed 3/15│   │
│ │ ✓ Session 2: HTML Basics        │ Completed 3/16│   │
│ │ ✓ Session 3: HTML Advanced      │ Completed 3/18│   │
│ │ ✓ Session 4: CSS Styling        │ Completed 3/22│   │
│ │ ✓ Session 5: Accessibility      │ Completed 3/25│   │
│ │ ✓ Session 6: Final Project      │ Completed 3/29│   │
│ │ ✓ Session 7: AI Tools           │ Completed 4/01│   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Last Active: 2 days ago                                │
│ [Close] [View Profile] [Send Message]                  │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Navigation Menu Updates

#### For Teachers (teacher: true)
Add menu item in profile dropdown:
```html
<li id="teacher-menu-item" style="display: none;">
  <a class="dropdown-item" href="#" onclick="createPath('pages/teacherCohortView.html')">
    My Cohorts
  </a>
</li>
```

#### For Tutors/Admins (tutor: true)
Add menu item in profile dropdown:
```html
<li id="admin-menu-item" style="display: none;">
  <a class="dropdown-item" href="#" onclick="createPath('pages/adminCohortView.html')">
    All Cohorts (Admin)
  </a>
</li>
```

Update `app.js` to show/hide based on user flags:
```javascript
if (userData.teacher) {
  document.getElementById('teacher-menu-item').style.display = 'block';
}
if (userData.tutor) {
  document.getElementById('admin-menu-item').style.display = 'block';
}
```

---

### 5. Session Completion Tracking

#### Add "Mark Complete" Button to Session Introduction Pages

**Location:** Each session introduction page (session1/introduction.html, etc.)

**Implementation:**
```html
<div class="completion-section">
  <button id="markCompleteBtn" class="btn btn-success">
    Mark Session as Complete ✓
  </button>
  <p id="completionStatus" class="text-muted"></p>
</div>
```

**JavaScript Logic:**
```javascript
async function checkSessionCompletion(sessionNumber) {
  const userId = fbAuth.currentUser.uid;
  const progressRef = fbDB.ref(`users/${userId}/progress/session${sessionNumber}`);
  const snapshot = await progressRef.once('value');
  const data = snapshot.val();
  
  if (data && data.completed) {
    document.getElementById('markCompleteBtn').textContent = 'Completed ✓';
    document.getElementById('markCompleteBtn').disabled = true;
    document.getElementById('completionStatus').textContent = 
      `Completed on ${new Date(data.completedDate).toLocaleDateString()}`;
  }
}

async function markSessionComplete(sessionNumber) {
  const userId = fbAuth.currentUser.uid;
  const progressRef = fbDB.ref(`users/${userId}/progress/session${sessionNumber}`);
  
  await progressRef.set({
    completed: true,
    completedDate: Date.now(),
    lastAccessed: Date.now()
  });
  
  // Update UI
  document.getElementById('markCompleteBtn').textContent = 'Completed ✓';
  document.getElementById('markCompleteBtn').disabled = true;
  document.getElementById('completionStatus').textContent = 
    `Completed on ${new Date().toLocaleDateString()}`;
}
```

#### Track Last Accessed Time

Update session navigation to track when students access sessions:
```javascript
async function trackSessionAccess(sessionNumber) {
  const userId = fbAuth.currentUser.uid;
  const progressRef = fbDB.ref(`users/${userId}/progress/session${sessionNumber}`);
  
  await progressRef.update({
    lastAccessed: Date.now()
  });
}
```

---

### 6. Teacher Registration Flow

#### Option 1: Special Teacher Code (Similar to Tutor Code)
```javascript
// In login.html addUserToDatabase function
if (cohortId === 'cTfTut0rCod3!1') {
  userData.tutor = true;
}
if (cohortId === 'cTfTeach3rCod3!') {  // NEW
  userData.teacher = true;
}
```

#### Option 2: Admin Assignment (Recommended)
- Tutors/admins can promote users to teacher status
- Add "Manage Teachers" page for admins
- Assign teachers to cohorts through admin interface

**Recommendation: Use Option 2 for better control**

---

### 7. Implementation Phases

#### Phase 1: Database Schema & Progress Tracking (Foundation)
1. Add `progress` object to user data structure
2. Add `teacherId` and `teacherName` to cohort structure
3. Add `teacher` boolean flag to user structure
4. Implement session completion tracking on all 7 session introduction pages
5. Test progress tracking with sample data

#### Phase 2: Teacher View (Core Feature)
1. Create `teacherCohortView.html` page
2. Implement cohort selection dropdown
3. Display student list with progress
4. Add search/filter/sort functionality
5. Implement student detail modal
6. Add navigation menu item for teachers
7. Test with single and multiple cohorts

#### Phase 3: Admin View (Extended Feature)
1. Create `adminCohortView.html` page
2. Display all cohorts with aggregate stats
3. Implement drill-down to cohort details
4. Add filtering and export functionality
5. Add navigation menu item for admins
6. Test with multiple cohorts and teachers

#### Phase 4: Teacher Management (Admin Tools)
1. Create teacher assignment interface
2. Allow admins to assign teachers to cohorts
3. Allow admins to promote users to teacher status
4. Add teacher management page
5. Test assignment and permission flows

#### Phase 5: Polish & Documentation
1. Add loading states and error handling
2. Implement responsive design for mobile
3. Add export to CSV functionality
4. Create user documentation
5. Update database documentation
6. Perform end-to-end testing

---

### 8. Technical Considerations

#### Security Rules (Firebase)
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid",
        "progress": {
          ".write": "$uid === auth.uid"
        }
      }
    },
    "cohorts": {
      ".read": "auth != null",
      ".write": "root.child('users').child(auth.uid).child('tutor').val() === true"
    }
  }
}
```

#### Performance Optimization
- Use Firebase queries with indexing for large cohorts
- Implement pagination for student lists (>50 students)
- Cache cohort data in localStorage for faster loading
- Use Firebase listeners for real-time updates (optional)

#### Error Handling
- Handle missing progress data gracefully
- Show appropriate messages for empty cohorts
- Validate teacher permissions on page load
- Provide fallback UI for network errors

---

### 9. Testing Checklist

#### Teacher View Testing
- [ ] Teacher with single cohort can view students
- [ ] Teacher with multiple cohorts can switch between them
- [ ] Progress bars display correctly
- [ ] Search functionality works
- [ ] Filter and sort work correctly
- [ ] Student detail modal displays accurate data
- [ ] Non-teachers cannot access page

#### Admin View Testing
- [ ] Tutors can see all cohorts
- [ ] Aggregate statistics are accurate
- [ ] Drill-down to cohort details works
- [ ] Filtering by teacher works
- [ ] Export functionality works
- [ ] Non-tutors cannot access page

#### Progress Tracking Testing
- [ ] Mark complete button works on all sessions
- [ ] Completion status persists across sessions
- [ ] Last accessed time updates correctly
- [ ] Progress displays correctly in teacher view
- [ ] Multiple students' progress tracked independently

---

### 10. Future Enhancements (Post-MVP)

1. **Email Notifications**
   - Notify teachers when students complete sessions
   - Weekly progress reports via email

2. **Analytics Dashboard**
   - Charts showing cohort progress over time
   - Identify struggling students automatically
   - Compare cohort performance

3. **Lesson-Level Tracking**
   - Track individual lesson completion within sessions
   - More granular progress reporting

4. **Student Messaging**
   - Allow teachers to message students directly
   - Bulk messaging for cohort announcements

5. **Certificates**
   - Auto-generate completion certificates
   - Track certificate issuance

---

## Summary

This plan provides a comprehensive approach to adding teacher/cohort management to Code the Future. The phased implementation allows for iterative development and testing, ensuring each component works correctly before moving to the next.

**Key Benefits:**
- Teachers can monitor student progress in real-time
- Course creators maintain global oversight
- Students have clear completion tracking
- Minimal disruption to existing functionality
- Scalable architecture for future enhancements

**Estimated Development Time:**
- Phase 1: 2-3 days
- Phase 2: 3-4 days
- Phase 3: 2-3 days
- Phase 4: 2-3 days
- Phase 5: 2-3 days
- **Total: 11-16 days**
