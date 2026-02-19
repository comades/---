import React, { useState } from 'react';
import { ViewProps } from '../types';
import { Trophy, Medal, Star, Flame, GraduationCap } from 'lucide-react';

const MOCK_CREATORS = [
  { id: 1, name: "StoryMaster", score: 15400, avatar: 12 },
  { id: 2, name: "TaipeiWalker", score: 12350, avatar: 5 },
  { id: 3, name: "GhostWriter", score: 9800, avatar: 8 },
  { id: 4, name: "GameGenius", score: 8500, avatar: 2 },
  { id: 5, name: "NovelAI", score: 6200, avatar: 15 },
];

const MOCK_PLAYERS = [
  { id: 1, name: "ExplorerOne", score: 880, avatar: 20 },
  { id: 2, name: "SpeedRunner", score: 750, avatar: 22 },
  { id: 3, name: "PuzzleKing", score: 720, avatar: 1 },
  { id: 4, name: "CasualGamer", score: 500, avatar: 4 },
  { id: 5, name: "Newbie", score: 150, avatar: 7 },
];

const MOCK_STUDENTS = [
  { id: 1, name: "LearningPro", score: 3200, avatar: 9 },
  { id: 2, name: "AcademyStar", score: 2950, avatar: 11 },
  { id: 3, name: "CertHunter", score: 2800, avatar: 18 },
  { id: 4, name: "DesignGuru", score: 2400, avatar: 14 },
  { id: 5, name: "StudentA", score: 1800, avatar: 6 },
];

export const Leaderboard: React.FC<ViewProps> = () => {
  const [activeTab, setActiveTab] = useState<'creators' | 'players' | 'students'>('creators');

  let data, title, scoreLabel, headerIcon;

  switch (activeTab) {
    case 'creators':
      data = MOCK_CREATORS;
      title = "頂尖創作者";
      scoreLabel = "人氣積分";
      headerIcon = <Flame size={24} className="text-orange-500" />;
      break;
    case 'players':
      data = MOCK_PLAYERS;
      title = "最強玩家";
      scoreLabel = "冒險點數";
      headerIcon = <Star size={24} className="text-pink-500" />;
      break;
    case 'students':
      data = MOCK_STUDENTS;
      title = "勤學風雲榜";
      scoreLabel = "學院學分";
      headerIcon = <GraduationCap size={24} className="text-indigo-500" />;
      break;
  }

  const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Medal className="text-yellow-400 h-6 w-6" />;
    if (rank === 2) return <Medal className="text-slate-400 h-6 w-6" />;
    if (rank === 3) return <Medal className="text-amber-600 h-6 w-6" />;
    return <span className="text-slate-500 font-bold w-6 text-center">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 sm:text-4xl flex items-center justify-center gap-3">
            <Trophy className="text-yellow-500 fill-yellow-500" size={32} />
            榮譽殿堂
          </h1>
          <p className="mt-4 text-slate-600">與全世界的玩家和創作者一較高下</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200 inline-flex flex-wrap justify-center gap-1 sm:gap-0">
            <button
              onClick={() => setActiveTab('creators')}
              className={`px-4 sm:px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center ${
                activeTab === 'creators' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Flame size={16} className="mr-2" />
              人氣創作者
            </button>
            <button
              onClick={() => setActiveTab('players')}
              className={`px-4 sm:px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center ${
                activeTab === 'players' 
                  ? 'bg-pink-500 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Star size={16} className="mr-2" />
              冒險排行榜
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 sm:px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center ${
                activeTab === 'students' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <GraduationCap size={16} className="mr-2" />
              勤學風雲榜
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div className="flex items-center">
                {headerIcon}
                <span className="ml-2">排名 / {title}</span>
            </div>
            <span>{scoreLabel}</span>
          </div>
          <div className="divide-y divide-slate-100">
            {data.map((item, index) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-4 sm:p-6 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 flex justify-center transform group-hover:scale-110 transition-transform">
                    <RankIcon rank={index + 1} />
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white shadow-sm group-hover:ring-indigo-100 transition-all">
                      <img 
                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${item.avatar}`} 
                        alt={item.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.name}</p>
                      <p className="text-xs text-slate-500 sm:hidden">Rank #{index + 1}</p>
                    </div>
                  </div>
                </div>
                <div className={`font-black text-lg sm:text-xl tabular-nums ${
                    activeTab === 'creators' ? 'text-orange-500' : 
                    activeTab === 'players' ? 'text-pink-500' : 'text-indigo-600'
                }`}>
                  {item.score.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};