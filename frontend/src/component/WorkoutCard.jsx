import "./WorkoutCard.css";

export default function WorkoutCard({ workout }) {
  return (
    <div className="workout-card">
      <h3>{workout.name}</h3>
      <div className="workout-info">
        <span>Target: {workout.targetMuscle}</span>
        <span>Sets: {workout.sets}</span>
        <span>Reps: {workout.reps}</span>
        <span>Rest: {workout.restTime} sec</span>
        {workout.duration && <span>Duration: {workout.duration} min</span>}
        {workout.caloriesBurned !== undefined && (
          <span>Calories: {workout.caloriesBurned} kcal</span>
        )}
      </div>
    </div>
  );
}
