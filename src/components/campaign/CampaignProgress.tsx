type Props = {
  collected: number;
  goal: number;
};

export default function CampaignProgress({
  collected,
  goal,
}: Props) {
  const percent =
    goal > 0
      ? Math.min(Math.round((collected / goal) * 100), 100)
      : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-green-600">
          Rp {collected.toLocaleString("id-ID")}
        </span>
        <span className="text-gray-500">
          dari Rp {goal.toLocaleString("id-ID")}
        </span>
      </div>

      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className="h-2 bg-green-500 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-xs text-gray-500">
        {percent}% tercapai
      </p>
    </div>
  );
}
