'use strict';

const prisma = require('../../prisma/prismaClient');
const ptmService = require('../services/ptm.service');

// Add error catching
const catchAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

exports.createEvent = catchAsync(async (req, res) => {
  const { title, date, startTime, endTime, slotDuration = 10 } = req.body;
  
  const ptmEvent = await prisma.pTMEvent.create({
    data: {
      schoolId: req.user.schoolId,
      title,
      date: new Date(date),
      startTime,
      endTime,
      slotDuration,
      createdById: req.user.id,
      status: 'UPCOMING'
    }
  });

  res.status(201).json({ success: true, data: ptmEvent });
});

exports.createSlot = catchAsync(async (req, res) => {
  const { ptmEventId } = req.params;
  const { teacherId, parentId, studentId, scheduledAt, duration = 10 } = req.body;

  const slot = await prisma.pTMSlot.create({
    data: {
      ptmEventId,
      teacherId,
      parentId,
      studentId,
      scheduledAt: new Date(scheduledAt),
      duration,
      status: 'CONFIRMED'
    }
  });

  // Kick off talking points generation asynchronously so we don't block
  ptmService.populateSlotWithTalkingPoints(slot.id, studentId).catch((err) => {
    console.error(`Failed to background generate talking points for slot ${slot.id}:`, err);
  });

  res.status(201).json({ success: true, data: slot });
});

exports.getSlotTalkingPoints = catchAsync(async (req, res) => {
  const { slotId } = req.params;

  const slot = await prisma.pTMSlot.findUnique({
    where: { id: slotId },
    select: { talkingPoints: true }
  });

  if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

  res.status(200).json({ success: true, talkingPoints: slot.talkingPoints });
});

exports.completeSlot = catchAsync(async (req, res) => {
  const { slotId } = req.params;
  const { notes } = req.body; // Raw teacher notes

  // Save notes and mark complete through the service (which triggers summary generation)
  const slotData = await prisma.pTMSlot.update({
    where: { id: slotId },
    data: { notes }
  });

  // Triggers generating the final summary message for parent asynchronously or sync depending on UI req
  // We'll await it so UI gets the summary back immediately to display to teacher, but we could make it async if it feels slow.
  const completedSlot = await ptmService.generatePostMeetingSummary(slotId, notes);

  res.status(200).json({ success: true, data: completedSlot });
});

exports.getTeacherDayDashboard = catchAsync(async (req, res) => {
  const { teacherId } = req.params; // or req.user.id if enforcing self

  const slots = await prisma.pTMSlot.findMany({
    where: { teacherId },
    include: {
      student: true,
      parent: { select: { name: true, email: true } },
      ptmEvent: true
    },
    orderBy: { scheduledAt: 'asc' }
  });

  res.status(200).json({ success: true, data: slots });
});

exports.getParentDashboard = catchAsync(async (req, res) => {
  const { parentId } = req.params; // or req.user.id

  const slots = await prisma.pTMSlot.findMany({
    where: { parentId },
    include: {
      student: true,
      teacher: { select: { name: true } },
      ptmEvent: true
    },
    orderBy: { scheduledAt: 'asc' }
  });

  res.status(200).json({ success: true, data: slots });
});
