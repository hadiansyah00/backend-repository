const { VisitLog, DownloadLog, Sequelize } = require('../models');
const { Op } = Sequelize;

exports.getSixMonthLineData = async () => {
  const lineData = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Generate buckets for the last 6 months including current month
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    lineData.push({
      name: monthNames[d.getMonth()],
      year: d.getFullYear(),
      month: d.getMonth(),
      views: 0,
      downloads: 0
    });
  }

  // The start date is the 1st day of the month 5 months ago
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // Fetch visit logs from the last 6 months
  const visits = await VisitLog.findAll({
    where: {
      visited_at: {
        [Op.gte]: sixMonthsAgo
      }
    },
    attributes: ['visited_at']
  });

  // Fetch download logs from the last 6 months
  const downloads = await DownloadLog.findAll({
    where: {
      downloaded_at: {
        [Op.gte]: sixMonthsAgo
      }
    },
    attributes: ['downloaded_at']
  });

  // Group visits
  visits.forEach(v => {
    const d = new Date(v.visited_at);
    if (!isNaN(d.getTime())) {
      const bucket = lineData.find(b => b.year === d.getFullYear() && b.month === d.getMonth());
      if (bucket) bucket.views++;
    }
  });

  // Group downloads
  downloads.forEach(d => {
    const date = new Date(d.downloaded_at);
    if (!isNaN(date.getTime())) {
      const bucket = lineData.find(b => b.year === date.getFullYear() && b.month === date.getMonth());
      if (bucket) bucket.downloads++;
    }
  });

  // Return clean list
  return lineData.map(b => ({
    name: b.name,
    views: b.views,
    downloads: b.downloads
  }));
};
