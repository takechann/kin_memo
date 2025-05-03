import { createContext, useState, useContext, useEffect } from 'react';

// Sample exercise types
const initialExerciseTypes = [
  "レッグプレス",
  "ダンベルプレス",
  "アブドミナル",
  "ショルダープレス",
  "チェストインクラインプレス",
  "ラテラルレイズ"
];

// Create context
const WorkoutContext = createContext();

// Custom hook to use the context
export const useWorkout = () => {
  return useContext(WorkoutContext);
};

export const WorkoutProvider = ({ children }) => {
  // State for workout records
  const [workouts, setWorkouts] = useState([]);
  // State for exercise types
  const [exerciseTypes, setExerciseTypes] = useState(initialExerciseTypes);
  // State for loading status
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on initial render
  useEffect(() => {
    const loadData = () => {
      try {
        // Load workouts
        const savedWorkouts = localStorage.getItem('workouts');
        if (savedWorkouts) {
          setWorkouts(JSON.parse(savedWorkouts));
        }

        // Load exercise types
        const savedExerciseTypes = localStorage.getItem('exerciseTypes');
        if (savedExerciseTypes) {
          setExerciseTypes(JSON.parse(savedExerciseTypes));
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save workouts to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('workouts', JSON.stringify(workouts));
    }
  }, [workouts, loading]);

  // Save exercise types to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('exerciseTypes', JSON.stringify(exerciseTypes));
    }
  }, [exerciseTypes, loading]);

  // Add a new workout record
  const addWorkout = (workout) => {
    // Add ID and timestamp
    const newWorkout = {
      ...workout,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    setWorkouts((prevWorkouts) => [...prevWorkouts, newWorkout]);

    // Add any new exercise types to the list
    const newExerciseTypes = [...exerciseTypes];
    workout.exercises.forEach((exercise) => {
      if (!exerciseTypes.includes(exercise.name)) {
        newExerciseTypes.push(exercise.name);
      }
    });

    if (newExerciseTypes.length !== exerciseTypes.length) {
      setExerciseTypes(newExerciseTypes);
    }

    return newWorkout;
  };

  // Get workouts for a specific date
  const getWorkoutsByDate = (date) => {
    return workouts.filter((workout) => {
      return workout.date === date;
    });
  };

  // Get all workouts
  const getAllWorkouts = () => {
    return workouts;
  };

  // Get all unique dates that have workouts
  const getWorkoutDates = () => {
    const dates = workouts.map((workout) => workout.date);
    return [...new Set(dates)].sort((a, b) => new Date(b) - new Date(a));
  };

  // Value object to be provided by the context
  const value = {
    workouts,
    exerciseTypes,
    loading,
    addWorkout,
    getWorkoutsByDate,
    getAllWorkouts,
    getWorkoutDates,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};