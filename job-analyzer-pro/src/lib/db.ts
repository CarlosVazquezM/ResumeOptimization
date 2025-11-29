import Dexie, { type EntityTable } from 'dexie'

// Define interfaces for database entities
export interface User {
  id?: number
  username: string
  email?: string
  role: 'user' | 'admin'
  preferredProvider?: string
  createdAt: Date
}

export interface Job {
  id?: number
  userId: number
  title: string
  company?: string
  description: string
  addedAt: Date
}

export interface Resume {
  id?: number
  userId: number
  originalText: string
  optimizedText?: string
  strategyUsed?: string
  cost?: number
  createdAt: Date
}

export interface OptimizationHistory {
  id?: number
  userId: number
  resumeId: number
  strategy: string
  cost: number
  duration: number
  timestamp: Date
}

// Create the database class
class JobAnalyzerDB extends Dexie {
  users!: EntityTable<User, 'id'>
  jobs!: EntityTable<Job, 'id'>
  resumes!: EntityTable<Resume, 'id'>
  optimizationHistory!: EntityTable<OptimizationHistory, 'id'>

  constructor() {
    super('JobAnalyzerProDB')

    // Define database schema
    this.version(1).stores({
      users: '++id, username, role, createdAt',
      jobs: '++id, userId, addedAt',
      resumes: '++id, userId, createdAt',
      optimizationHistory: '++id, userId, resumeId, timestamp',
    })
  }
}

// Export database instance
export const db = new JobAnalyzerDB()

// Helper functions for common operations
export const userHelpers = {
  async getCurrentUser(): Promise<User | undefined> {
    const users = await db.users.toArray()
    return users.length > 0 ? users[0] : undefined
  },

  async createUser(username: string, email?: string): Promise<number> {
    return await db.users.add({
      username,
      email,
      role: 'user',
      createdAt: new Date(),
    })
  },

  async getJobsByUser(userId: number): Promise<Job[]> {
    return await db.jobs.where('userId').equals(userId).toArray()
  },
}
