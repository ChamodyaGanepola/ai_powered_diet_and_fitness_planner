import MealPlanCard from "../../component/MealPlanCard.jsx";
import "./DietPlan.css";
import Header from "../../component/Header.jsx";
import Footer from "../../component/Footer.jsx";
import { useAuth } from "../../context/authContext.jsx";
const mockMealPlans = [
  {
    _id: "1",
    startDate: "2026-01-01",
    totalCalories: 2100,
    totalProtein: 120,
    meals: [
      {
        mealType: "Breakfast",
        items: [
          { name: "Smoked salmon", calories: 140, protein: 16, fat: 5 },
          { name: "Whole wheat toast", calories: 120, protein: 6, fat: 2 }
        ]
      },
      {
        mealType: "Lunch",
        items: [
          { name: "Grilled chicken", calories: 300, protein: 35, fat: 6 }
        ]
      },
      {
        mealType: "Snack",
        items: [
          { name: "Greek yogurt", calories: 150, protein: 15, fat: 4 }
        ]
      },
      {
        mealType: "Dinner",
        items: [
          { name: "Salmon & veggies", calories: 400, protein: 30, fat: 12 }
        ]
      }
    ]
  },
  {
    _id: "2",
    startDate: "2026-01-02",
    totalCalories: 2100,
    totalProtein: 120,
    meals: [
      {
        mealType: "Breakfast",
        items: [
          { name: "Smoked salmon", calories: 140, protein: 16, fat: 5 },
          { name: "Whole wheat toast", calories: 120, protein: 6, fat: 2 }
        ]
      },
      {
        mealType: "Lunch",
        items: [
          { name: "Grilled chicken", calories: 300, protein: 35, fat: 6 }
        ]
      },
      {
        mealType: "Snack",
        items: [
          { name: "Greek yogurt", calories: 150, protein: 15, fat: 4 }
        ]
      },
      {
        mealType: "Dinner",
        items: [
          { name: "Salmon & veggies", calories: 400, protein: 30, fat: 12 }
        ]
      }
    ]
  }
];


export default function DietPlan() {
  const { user} = useAuth();
  return (
    <>
    <Header />
    <div className="diet-page">
      <h1>{user.username} Welcome to Your Diet Plans</h1>
        {mockMealPlans.map((plan, index) => (
          // Pass index to MealPlanCard
          <MealPlanCard key={plan._id} plan={plan} index={index} />
      ))}
    </div>
    <Footer />
    </>
  );
}
