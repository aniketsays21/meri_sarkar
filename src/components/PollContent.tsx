import { Vote, TrendingUp, Users } from "lucide-react";
import { Button } from "./ui/button";

const mockPolls = [
  {
    id: 1,
    question: "Should the government increase infrastructure spending?",
    options: [
      { text: "Yes, prioritize roads and bridges", votes: 245 },
      { text: "Yes, but focus on public transport", votes: 189 },
      { text: "No, focus on other sectors", votes: 67 },
    ],
    totalVotes: 501,
    endsAt: "2 days left",
  },
  {
    id: 2,
    question: "What should be the priority for your constituency?",
    options: [
      { text: "Better healthcare facilities", votes: 312 },
      { text: "Improved education system", votes: 267 },
      { text: "Clean water supply", votes: 198 },
      { text: "Street lighting & safety", votes: 145 },
    ],
    totalVotes: 922,
    endsAt: "5 days left",
  },
];

export const PollContent = () => {
  const getPercentage = (votes: number, total: number) => {
    return Math.round((votes / total) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <Vote className="w-6 h-6 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Community Polls</h2>
        </div>
        <p className="text-sm text-gray-600">
          Vote on issues that matter to your constituency
        </p>
      </div>

      <div className="space-y-6">
        {mockPolls.map((poll) => (
          <div key={poll.id} className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">{poll.question}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{poll.totalVotes} votes</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{poll.endsAt}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {poll.options.map((option, idx) => {
                const percentage = getPercentage(option.votes, poll.totalVotes);
                return (
                  <button
                    key={idx}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{option.text}</span>
                      <span className="text-sm font-semibold text-purple-600">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <Button variant="outline" className="w-full">
              View Results
            </Button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
        <p className="text-sm text-gray-500 mb-3">
          Want to create your own poll?
        </p>
        <Button className="w-full">Create New Poll</Button>
      </div>
    </div>
  );
};
