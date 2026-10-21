/* 排程题配置（PDF01 手工核对；其余由图片自动解码） */
window.SCHEDULES = {
 "PDF01": {
  "dayStart": 9,
  "dayEnd": 18,
  "busy": [
   {
    "label": "Catch-up",
    "start": 9.5,
    "len": 0.5
   },
   {
    "label": "Team Meeting",
    "start": 11,
    "len": 1
   },
   {
    "label": "Lunch",
    "start": 12.5,
    "len": 1
   },
   {
    "label": "Client Meeting",
    "start": 14.5,
    "len": 1
   },
   {
    "label": "Project Planning",
    "start": 16,
    "len": 0.5
   }
  ],
  "tasks": [
   {
    "id": "fei",
    "name": "Call Fei",
    "len": 0.5
   },
   {
    "id": "prep",
    "name": "Prep for Client Meeting",
    "len": 1
   },
   {
    "id": "comp",
    "name": "Competitor Analysis",
    "len": 1
   },
   {
    "id": "sheet",
    "name": "Timesheet",
    "len": 0.5
   }
  ],
  "answer": {
   "fei": 9,
   "prep": 10,
   "comp": 16.5,
   "sheet": 17.5
  }
 },
 "PDF02": {
  "dayStart": 9,
  "dayEnd": 18.0,
  "busy": [
   {
    "start": 9.0,
    "len": 0.5
   },
   {
    "start": 10.5,
    "len": 1.0
   },
   {
    "start": 14.0,
    "len": 1.0
   },
   {
    "start": 16.0,
    "len": 0.5
   },
   {
    "start": 17.0,
    "len": 0.5
   }
  ],
  "tasks": [
   {
    "id": "stake",
    "name": "Stakeholder Meeting",
    "len": 1
   },
   {
    "id": "coffee",
    "name": "Coffee with Jeremy",
    "len": 1
   },
   {
    "id": "catchup",
    "name": "Weekly Catch-up",
    "len": 1.5
   },
   {
    "id": "train",
    "name": "Training",
    "len": 0.5
   }
  ],
  "answer": {
   "stake": 9.5,
   "catchup": 12.5,
   "coffee": 15.0,
   "train": 17.5
  }
 },
 "PDF03": {
  "dayStart": 9,
  "dayEnd": 18.0,
  "busy": [
   {
    "start": 9.0,
    "len": 0.5
   },
   {
    "start": 10.0,
    "len": 0.5
   },
   {
    "start": 12.5,
    "len": 1.0
   },
   {
    "start": 14.5,
    "len": 0.5
   },
   {
    "start": 17.0,
    "len": 0.5
   }
  ],
  "tasks": [
   {
    "id": "ct1",
    "name": "CT #1",
    "len": 1
   },
   {
    "id": "mri1",
    "name": "MRI #1 (before 4pm)",
    "len": 0.5
   },
   {
    "id": "ct2",
    "name": "CT #2 (before 3pm)",
    "len": 1
   },
   {
    "id": "mri2",
    "name": "MRI #2 (as early as possible)",
    "len": 0.5
   }
  ],
  "answer": {
   "mri2": 10.5,
   "ct2": 11.5,
   "mri1": 15.0,
   "ct1": 16.0
  }
 },
 "PDF04": {
  "dayStart": 8,
  "dayEnd": 17.0,
  "busy": [
   {
    "start": 8.0,
    "len": 1.0
   },
   {
    "start": 9.5,
    "len": 0.5
   },
   {
    "start": 12.0,
    "len": 1.0
   },
   {
    "start": 14.5,
    "len": 0.5
   }
  ],
  "tasks": [
   {
    "id": "brain",
    "name": "Brainstorm",
    "len": 1
   },
   {
    "id": "report",
    "name": "Finish Report",
    "len": 2
   },
   {
    "id": "train",
    "name": "Training",
    "len": 1.5
   },
   {
    "id": "sales",
    "name": "Sales Figures",
    "len": 0.5
   }
  ],
  "answer": {
   "sales": 9.0,
   "report": 10.0,
   "brain": 13.5,
   "train": 15.0
  }
 },
 "PDF05": {
  "mode": "lanes",
  "dayStart": 9,
  "dayEnd": 18.0,
  "lanes": [
   {
    "name": "Banquet Room A",
    "busy": [
     {
      "start": 9.5,
      "len": 1.5
     },
     {
      "start": 14.5,
      "len": 1.0
     }
    ],
    "editable": false
   },
   {
    "name": "Banquet Room B",
    "busy": [
     {
      "start": 10.5,
      "len": 2.0
     },
     {
      "start": 13.5,
      "len": 1.0
     },
     {
      "start": 15.0,
      "len": 1.5
     }
    ],
    "editable": false
   },
   {
    "name": "Banquet Room C",
    "busy": [
     {
      "start": 11.0,
      "len": 1.0
     },
     {
      "start": 13.0,
      "len": 1.0
     },
     {
      "start": 15.0,
      "len": 1.5
     }
    ],
    "editable": false
   },
   {
    "name": "Banquet Room D",
    "busy": [
     {
      "start": 11.5,
      "len": 1.5
     }
    ],
    "editable": true
   }
  ],
  "slotLen": 1.5,
  "answer": {
   "lane": 3,
   "start": 14
  }
 },
 "PDF06": {
  "mode": "lanes",
  "dayStart": 7,
  "dayEnd": 16.0,
  "lanes": [
   {
    "name": "Edit Bay 1",
    "busy": [
     {
      "start": 8.0,
      "len": 1.0
     },
     {
      "start": 11.0,
      "len": 0.5
     },
     {
      "start": 13.0,
      "len": 1.0
     }
    ],
    "editable": false
   },
   {
    "name": "Edit Bay 2",
    "busy": [
     {
      "start": 7.5,
      "len": 0.5
     },
     {
      "start": 8.5,
      "len": 0.5
     },
     {
      "start": 9.5,
      "len": 0.5
     },
     {
      "start": 10.5,
      "len": 0.5
     },
     {
      "start": 12.0,
      "len": 0.5
     },
     {
      "start": 13.0,
      "len": 0.5
     },
     {
      "start": 14.0,
      "len": 0.5
     },
     {
      "start": 15.0,
      "len": 0.5
     }
    ],
    "editable": false
   },
   {
    "name": "Edit Bay 3",
    "busy": [
     {
      "start": 9.0,
      "len": 0.5
     },
     {
      "start": 10.0,
      "len": 1.0
     },
     {
      "start": 12.0,
      "len": 1.0
     },
     {
      "start": 14.0,
      "len": 1.0
     },
     {
      "start": 15.5,
      "len": 0.5
     }
    ],
    "editable": false
   },
   {
    "name": "Edit Bay 4",
    "busy": [
     {
      "start": 7.5,
      "len": 1.0
     },
     {
      "start": 9.5,
      "len": 0.5
     },
     {
      "start": 11.0,
      "len": 0.5
     },
     {
      "start": 12.5,
      "len": 1.0
     }
    ],
    "editable": true
   }
  ],
  "slotLen": 1,
  "answer": null
 },
 "PDF07": {
  "mode": "lanes",
  "dayStart": 7,
  "dayEnd": 16.0,
  "lanes": [
   {
    "name": "Recording Studio 1",
    "busy": [
     {
      "start": 7.5,
      "len": 1.0
     },
     {
      "start": 10.5,
      "len": 1.0
     },
     {
      "start": 13.0,
      "len": 1.0
     }
    ],
    "editable": false
   },
   {
    "name": "Recording Studio 2",
    "busy": [
     {
      "start": 7.0,
      "len": 0.5
     },
     {
      "start": 8.0,
      "len": 0.5
     },
     {
      "start": 9.0,
      "len": 0.5
     },
     {
      "start": 10.0,
      "len": 0.5
     },
     {
      "start": 11.0,
      "len": 0.5
     },
     {
      "start": 12.0,
      "len": 0.5
     },
     {
      "start": 13.0,
      "len": 0.5
     },
     {
      "start": 14.0,
      "len": 0.5
     },
     {
      "start": 15.0,
      "len": 0.5
     }
    ],
    "editable": false
   },
   {
    "name": "Recording Studio 3",
    "busy": [
     {
      "start": 8.5,
      "len": 0.5
     },
     {
      "start": 9.5,
      "len": 1.0
     },
     {
      "start": 11.5,
      "len": 1.5
     },
     {
      "start": 14.0,
      "len": 1.0
     },
     {
      "start": 15.5,
      "len": 0.5
     }
    ],
    "editable": false
   },
   {
    "name": "Recording Studio 4",
    "busy": [
     {
      "start": 7.5,
      "len": 0.5
     },
     {
      "start": 8.5,
      "len": 0.5
     },
     {
      "start": 9.5,
      "len": 1.0
     },
     {
      "start": 11.5,
      "len": 0.5
     },
     {
      "start": 13.5,
      "len": 0.5
     }
    ],
    "editable": true
   }
  ],
  "slotLen": 1,
  "answer": {
   "lane": 3,
   "start": 13
  }
 }
,
  PDF08: {
    "mode": "lanes", "dayStart": 9, "dayEnd": 18,
    "lanes": [
      {"name": "Machine 1", "busy": [{"start": 9, "len": 1}, {"start": 11.5, "len": 1}], "editable": false},
      {"name": "Machine 2", "busy": [{"start": 10.5, "len": 1}, {"start": 15.5, "len": 0.5}], "editable": false},
      {"name": "Machine 3", "busy": [{"start": 11.5, "len": 1}, {"start": 14, "len": 0.5}, {"start": 16.5, "len": 0.5}], "editable": false},
      {"name": "Machine 4", "busy": [{"start": 10, "len": 1}, {"start": 13.5, "len": 0.5}], "editable": true}
    ],
    "slotLen": 1,
    "answer": {"lane": 3, "start": 15.5}
  }
,
  PDF09: {
    dayStart: 9, dayEnd: 18,
    busy: [
      { label: 'Busy', start: 9, len: 1 },
      { label: 'Busy', start: 13, len: 1.5 },
      { label: 'Busy', start: 15, len: 1 },
      { label: 'Busy', start: 16.5, len: 1 }
    ],
    tasks: [
      { id: 'prep', name: 'Prepare Faisal', len: 1 },
      { id: 'review', name: 'Review presentation', len: 1 }
    ],
    answer: { prep: 11, review: 12 }
  },
  PDF10: {
    dayStart: 9, dayEnd: 18,
    busy: [
      { label: 'Busy', start: 9, len: 1 },
      { label: 'Busy', start: 10.5, len: 1 },
      { label: 'Busy', start: 13.5, len: 1 },
      { label: 'Busy', start: 15.5, len: 1 }
    ],
    tasks: [
      { id: 'report', name: 'Research Report', len: 2 },
      { id: 'survey', name: 'Survey Summary', len: 1 }
    ],
    answer: { report: 12, survey: 14.5 }
  }
};
