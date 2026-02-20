module.exports = {
  ApiResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string" },
      data: { type: "object" },
    },
  },

  User: {
    type: "object",
    properties: {
      id: { type: "integer" },
      name: { type: "string" },
      email: { type: "string" },
    },
  },
  DashboardStats: {
    type: "object",
    properties: {
      totalUsers: { type: "integer" },
      totalRepositories: { type: "integer" },
      totalDownloads: { type: "integer" },
    },
  },
};