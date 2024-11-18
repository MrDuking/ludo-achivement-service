export class GetAllAchievementsResponse {
    statusCode: number
    code: string
    message: string
    data: {
        achievements: Achievement[]
    }
}

export class Achievement {
    _id: string
    name: string
    description: string
    type: number
    requirementType: number
    isActive: boolean
    milestones: Milestone[]
}

export class Milestone {
    _id: string
    goal: number
    reward: Reward
    achievementId: string
}

export class Reward {
    type: number
    value: number
}

export class UserAchievement {
    _id: string
    name: string
    description: string
    type: number
    isActive: boolean
    requirementType: number
    userId: string
    currentProgress: number
    lastResetDate: number
    milestones: UserMilestone[]
}

export class UserMilestone {
    _id: string
    goal: number
    reward: Reward
    achievementId: string
    userMilestoneId: string
    userAchievementId: string
    rewardCollected: boolean
    isCompleted: boolean
    completedAt: number
}

export class CreateAchievementRequest {
    name: string
    description: string
    type: number
    requirementType: number
    isActive: boolean
}

export class UpdateAchievementRequest {
    id: string
    name?: string
    description?: string
    type?: number
    requirementType?: number
    isActive?: boolean
}

export class AchievementIdMessage {
    achievementId: string
}

export class GetAllAchievementsByUserRequest {
    userId: string
}

export class GetAllAchievementsByUserResponse {
    code: string
    data: {
        achievements: UserAchievement[]
    }
}

export class DeleteAchievementResponse {
    message: string
    code: string
}
