import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

// Types for better type safety
export type CVData = {
  title: string;
  personalInfo?: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
  };
  summary?: string;
  experience?: Array<{
    position: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    description: string;
  }>;
  skills?: string[];
};

export type CVContent = {
  personalInfo?: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
  };
  summary?: string;
  experience?: Array<{
    position: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    description: string;
  }>;
  skills?: string[];
};

// User Operations
export const userOperations = {
  // Create a new user
  async create(data: { name: string; email: string; password: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });
  },

  // Find user by email
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  // Find user by ID
  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  },

  // Update user
  async update(
    id: string,
    data: Partial<{ name: string; email: string; image: string }>
  ) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  },

  // Delete user
  async delete(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  },

  // Check if user exists by email
  async existsByEmail(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  },

  // Verify user password
  async verifyPassword(email: string, password: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true },
    });

    if (!user) return false;

    return await bcrypt.compare(password, user.password);
  },
};

// CV Operations
export const cvOperations = {
  // Create a new CV
  async create(userId: string, data: CVData) {
    return await prisma.cV.create({
      data: {
        userId,
        title: data.title,
        content: {
          personalInfo: data.personalInfo,
          summary: data.summary,
          experience: data.experience,
          education: data.education,
          skills: data.skills,
        },
        template: "default",
      },
    });
  },

  // Find CV by ID and user ID
  async findByIdAndUserId(id: string, userId: string) {
    return await prisma.cV.findUnique({
      where: {
        id,
        userId,
      },
    });
  },

  // Find all CVs for a user
  async findAllByUserId(userId: string) {
    return await prisma.cV.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  },

  // Update CV
  async update(id: string, userId: string, data: CVData) {
    return await prisma.cV.update({
      where: {
        id,
        userId,
      },
      data: {
        title: data.title,
        content: {
          personalInfo: data.personalInfo,
          summary: data.summary,
          experience: data.experience,
          education: data.education,
          skills: data.skills,
        },
        updatedAt: new Date(),
      },
    });
  },

  // Update CV file path (after PDF generation)
  async updateFilePath(id: string, filePath: string) {
    return await prisma.cV.update({
      where: { id },
      data: { filePath },
    });
  },

  // Delete CV
  async delete(id: string, userId: string) {
    return await prisma.cV.delete({
      where: {
        id,
        userId,
      },
    });
  },

  // Count CVs for a user
  async countByUserId(userId: string): Promise<number> {
    return await prisma.cV.count({
      where: { userId },
    });
  },

  // Find CV by ID (without user restriction) - for admin purposes
  async findById(id: string) {
    return await prisma.cV.findUnique({
      where: { id },
    });
  },

  // Update CV template
  async updateTemplate(id: string, userId: string, template: string) {
    return await prisma.cV.update({
      where: {
        id,
        userId,
      },
      data: { template },
    });
  },

  // Get CV with user info
  async findWithUser(id: string, userId: string) {
    return await prisma.cV.findUnique({
      where: {
        id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },
};

// Database utility functions
export const dbUtils = {
  // Test database connection
  async testConnection() {
    try {
      await prisma.$connect();
      return true;
    } catch (error) {
      console.error("Database connection failed:", error);
      return false;
    }
  },

  // Disconnect from database
  async disconnect() {
    await prisma.$disconnect();
  },

  // Get database stats
  async getStats() {
    const [userCount, cvCount] = await Promise.all([
      prisma.user.count(),
      prisma.cV.count(),
    ]);

    return {
      users: userCount,
      cvs: cvCount,
    };
  },

  // Clean up old CVs without file paths (optional cleanup function)
  async cleanupOrphanedCVs() {
    return await prisma.cV.deleteMany({
      where: {
        filePath: null,
        createdAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days old
        },
      },
    });
  },
};

// Transaction wrapper for complex operations
export const dbTransactions = {
  // Create user with initial CV
  async createUserWithCV(
    userData: { name: string; email: string; password: string },
    cvData: CVData
  ) {
    return await prisma.$transaction(async (tx) => {
      // Create user
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await tx.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
        },
      });

      // Create initial CV
      const cv = await tx.cV.create({
        data: {
          userId: user.id,
          title: cvData.title,
          content: {
            personalInfo: cvData.personalInfo,
            summary: cvData.summary,
            experience: cvData.experience,
            education: cvData.education,
            skills: cvData.skills,
          },
          template: "default",
        },
      });

      return { user, cv };
    });
  },

  // Delete user and all associated CVs
  async deleteUserWithCVs(userId: string) {
    return await prisma.$transaction(async (tx) => {
      // Delete all CVs first
      await tx.cV.deleteMany({
        where: { userId },
      });

      // Delete user
      await tx.user.delete({
        where: { id: userId },
      });
    });
  },
};

// Export the prisma instance for direct use if needed
export { prisma } from "./prisma";
