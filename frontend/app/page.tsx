import ExerciseSelector from "@/components/ExerciseSelector";

export default function HomePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Bir egzersiz seç</h1>
        <p className="text-gray-400">
          Hareketi seç, varsa rahatsızlığını gir; FitGuard AI formunu gerçek zamanlı takip eder.
        </p>
      </div>
      <ExerciseSelector />
    </div>
  );
}
