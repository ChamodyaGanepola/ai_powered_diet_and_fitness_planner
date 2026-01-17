import "./WorkoutCard.css";

export default function WorkoutCard({ workout }) {
  return (
    <div className="workout-card">
      <h3>{workout.name}</h3>
      <div className="workout-info">
        <span><b>Target:</b> {workout.targetMuscle}</span>
        <span><b>Sets:</b> {workout.sets}</span>
        <span><b>Reps:</b> {workout.reps}</span>
        <span><b>Rest:</b> {workout.restTime} sec</span>
        {workout.duration && <span><b>Duration:</b> {workout.duration} min</span>}
        {workout.caloriesBurned !== undefined && (
          <span><b>Calories Burned:</b> {workout.caloriesBurned} kcal</span>
        )}
      </div>
    </div>
  );
}
