import { MessageSquare, Users, TrendingUp, Sparkles } from "lucide-react";

export const CommunityContent = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl p-8 border border-pink-100 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-sm">
          <MessageSquare className="w-8 h-8 text-pink-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Community Coming Soon!</h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          A space to discuss politics intelligently with fellow citizens in your area
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Local Discussions</h3>
              <p className="text-sm text-gray-600">
                Connect with citizens in your ward and constituency to discuss local issues
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Trending Topics</h3>
              <p className="text-sm text-gray-600">
                See what political issues and policies people are talking about
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Polls & Opinions</h3>
              <p className="text-sm text-gray-600">
                Vote on local decisions and see what your community thinks
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          🚀 We're building this feature with your feedback
        </p>
      </div>
    </div>
  );
};
