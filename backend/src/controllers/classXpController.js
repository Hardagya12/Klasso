const xpService = require('../utils/classXpService');
const { prisma } = require('../db/prisma');

exports.getClassXpDetails = async (req, res) => {
  try {
    const { classId } = req.params;
    const details = await xpService.getClassXPDetails(classId);
    if (!details) {
      return res.status(404).json({ success: false, message: 'Class XP not found' });
    }
    res.json({ success: true, data: details });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.awardBonusXp = async (req, res) => {
  try {
    const { classId } = req.params;
    const { xp, reason } = req.body;
    
    const allowed = new Set(['TEACHER', 'ADMIN', 'SUPER_ADMIN']);
    if (!req.user || !allowed.has(String(req.user.role).toUpperCase())) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const amount = Number(xp);
    if (isNaN(amount) || amount < 10 || amount > 100) {
      return res.status(400).json({ success: false, message: 'Invalid XP amount. Must be 10-100.' });
    }
    
    const result = await xpService.awardXP(classId, 'TEACHER_BONUS', req.user.id, amount, reason);
    if (!result) {
      return res.status(500).json({ success: false, message: 'Failed to award bonus XP' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getClassXpEvents = async (req, res) => {
  try {
    const { classId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const classXp = await prisma.classXP.findUnique({
      where: { classId }
    });

    if (!classXp) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const events = await prisma.xPEvent.findMany({
      where: { classXpId: classXp.id },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSchoolLeaderboard = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const sortBy = req.query.sort === 'weekly' ? 'weeklyXP' : 'totalXP';

    const classes = await prisma.classXP.findMany({
      where: {
        class: { schoolId: schoolId }
      },
      include: {
         class: { select: { id: true, name: true, section: true } }
      },
      orderBy: { [sortBy]: 'desc' }
    });

    res.json({ success: true, data: classes });
  } catch(error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
