// Exercise Types
export type ExerciseType = 'weight_reps' | string // Add other possible values as needed
export type MuscleGroup = string // Add specific muscle groups as needed
export type SetType = 'warmup' | 'normal' | 'failure' | 'dropset'

// Base Set Interface
interface BaseSet {
  index: number
  set_type: SetType
  weight_kg: number | null
  reps: number | null
  distance_meters: number | null
  duration_seconds: number | null
  rpe: number | null
}

// Exercise Template
export interface ExerciseTemplate {
  id: string
  title: string
  type: ExerciseType
  primary_muscle_group: MuscleGroup
  secondary_muscle_groups: MuscleGroup[]
  is_custom: boolean
}

// Exercise in Workout/Routine
export interface Exercise {
  index: number
  title: string
  notes: string
  exercise_template_id: string
  supersets_id: number | null
  sets: BaseSet[]
}

// Workout
export interface Workout {
  id: string
  title: string
  description: string
  start_time: string // ISO 8601 timestamp
  end_time: string // ISO 8601 timestamp
  updated_at: string // ISO 8601 timestamp
  created_at: string // ISO 8601 timestamp
  exercises: Exercise[]
}

// Routine
export interface Routine {
  id: string
  title: string
  folder_id: number | null
  updated_at: string // ISO 8601 timestamp
  created_at: string // ISO 8601 timestamp
  exercises: Exercise[]
}

// Routine Folder
export interface RoutineFolder {
  id: number
  index: number
  title: string
  updated_at: string // ISO 8601 timestamp
  created_at: string // ISO 8601 timestamp
}

// Request Bodies
export interface PostWorkoutsRequestSet {
  type: SetType
  weight_kg?: number
  reps?: number
  distance_meters?: number
  duration_seconds?: number
}

export interface PostWorkoutsRequestExercise {
  exercise_template_id: string
  superset_id?: number
  notes?: string
  sets: PostWorkoutsRequestSet[]
}

export interface PostWorkoutsRequestBody {
  workout: {
    title: string
    description?: string
    start_time: string // ISO 8601 timestamp
    end_time: string // ISO 8601 timestamp
    is_private: boolean
    exercises: PostWorkoutsRequestExercise[]
  }
}

export interface PostRoutinesRequestSet extends PostWorkoutsRequestSet {}

export interface PostRoutinesRequestExercise {
  exercise_template_id: string
  superset_id?: number
  rest_seconds?: number
  notes?: string
  sets: PostRoutinesRequestSet[]
}

export interface PostRoutinesRequestBody {
  routine: {
    title: string
    folder_id?: number
    notes: string
    exercises: PostRoutinesRequestExercise[]
  }
}

export interface PostRoutineFolderRequestBody {
  routine_folder: {
    title: string
  }
}

// Workout Events
export interface UpdatedWorkout {
  type: 'updated'
  workout: Workout
}

export interface DeletedWorkout {
  type: 'deleted'
  id: string
  deleted_at: string // ISO 8601 timestamp
}

export type WorkoutEvent = UpdatedWorkout | DeletedWorkout

export interface PaginatedWorkoutEvents {
  page: number
  page_count: number
  events: WorkoutEvent[]
}

// Paginated Response Types
export interface PaginatedResponse<T> {
  page: number
  page_count: number
  [key: string]: T[] | number // This allows for different array names (workouts, routines, etc.)
}