export interface CreateUpdateAchievementResponse {
    code: string
    data: {
        _id: string
        name: string
        description: string
        type: number
        requirementType: number
        isActive: boolean
        milestones: any
    }
}
