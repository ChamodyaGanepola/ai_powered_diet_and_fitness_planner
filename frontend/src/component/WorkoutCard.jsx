import "./WorkoutCard.css";

export default function WorkoutCard({ workout }) {
  return (
    <div className="workout-card">
      <h3>{workout.name}</h3>

      <div className="workout-info">
        {workout.targetMuscle && (
          <span className="workout-metric target">
            <b>Target:</b> {workout.targetMuscle}
          </span>
        )}

        {workout.sets !== undefined && (
          <span className="workout-metric sets">
            <b>Sets:</b> {workout.sets}
          </span>
        )}

        {workout.reps !== undefined && (
          <span className="workout-metric reps">
            <b>Reps:</b> {workout.reps}
          </span>
        )}

        {workout.restTime !== undefined && (
          <span className="workout-metric rest">
            <b>Rest:</b> {workout.restTime} sec
          </span>
        )}

        {workout.duration !== undefined && (
          <span className="workout-metric duration">
            <b>Duration:</b> {workout.duration} min
          </span>
        )}

        {workout.caloriesBurned !== undefined && (
          <span className="workout-metric kcal">
            <b>Calories:</b> {workout.caloriesBurned} kcal
          </span>
        )}
      </div>
    </div>
  );
}
