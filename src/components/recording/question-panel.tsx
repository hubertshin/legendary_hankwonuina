"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Baby } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionPanelProps {
  projectId?: string;
  sessionId?: string;
}

const QUESTIONS = [
  {
    id: "q1",
    text: "어디서 태어나셨고, 본인의 탄생 시점에 대해 부모님께 들은 이야기를 공유해주세요. (태몽, 태어난 시각, 출생할 때 어머니께 있었던 일, 가족들의 반응 등)",
  },
  {
    id: "q2",
    text: "어린 시절 살던 곳이 어디였고, 그 살던 곳을 냄새, 풍경, 느낌, 인상으로 자세히 묘사해주세요.",
  },
  {
    id: "q3",
    text: "어린 시절, 본인은 어떤 성격의 아이였다고 기억하시나요?",
  },
  {
    id: "q4",
    text: "어린 시절 함께 살던 가족 구성원이 어땠었나요?(형제자매, 부모, 친척)",
  },
  {
    id: "q5",
    text: "그 당시, 부모님은 어떤 일을 하셨었나요?",
  },
  {
    id: "q6",
    text: "친척(할머니/할아버지/삼촌/이모 등)과 함께 살았다면 그 분들이 했던 일이나 함께 공유했던 추억들은 어떤 게 있나요?",
  },
  {
    id: "q7",
    text: "어머니 혹은 아버지(주양육자)와의 기억 중 가장 따뜻했던 추억은 어떤 게 있나요? (구체적인 에피소드를 얘기해주시면 자서전에 풍부한 내용이 담깁니다.)",
  },
  {
    id: "q8",
    text: "형제자매와의 기억 중 따뜻했던 추억은 어떤 게 있나요?",
  },
  {
    id: "q9",
    text: "함께 살았던 가족들은 각각 주인공님과 어떤 관계를 가졌었나요? (예: 함께 노는 관계였는지, 나를 따뜻하게 보살펴준 관계였는지, 엄한 가르침을 주시는 관계였는지 등)",
  },
  {
    id: "q10",
    text: "당시 가족 중에 당신에게 가장 큰 영향을 준 사람은 누구였나요? 어떤 영향력을 주셨나요?",
  },
  {
    id: "q11",
    text: "어린 시절 사귀었던 친구들 중 기억에 남는 친구가 있나요? 그 친구들과 어떤 추억, 에피소드가 있나요?",
  },
  {
    id: "q12",
    text: "어린 시절에 했던 놀이 중에 기억에 남는 것이 있나요? 그 놀이들의 규칙과 그 때의 즐거움, 감정을 자세하게 묘사해주세요.",
  },
];

export function QuestionPanel({ projectId, sessionId }: QuestionPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [checkedQuestions, setCheckedQuestions] = useState<Set<string>>(new Set());

  // Use either projectId or sessionId for localStorage key
  const storageKey = projectId ? `questions-${projectId}` : sessionId ? `questions-${sessionId}` : 'questions-default';

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setCheckedQuestions(new Set(JSON.parse(saved)));
    }
  }, [storageKey]);

  // Save progress to localStorage
  const toggleQuestion = (questionId: string) => {
    setCheckedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      localStorage.setItem(storageKey, JSON.stringify([...newSet]));
      return newSet;
    });
  };

  const progress = (checkedQuestions.size / QUESTIONS.length) * 100;

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Baby className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-warm-900">
              질문 보고 녹음하기
            </h3>
            <p className="text-sm text-warm-500">
              🧒 유년기와 가족 이야기 (태어나기 전부터 국민학교 입학 전까지)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-sm font-medium text-primary">
              {checkedQuestions.size}/{QUESTIONS.length}
            </span>
            <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-primary/20">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-warm-400" />
          ) : (
            <ChevronUp className="h-5 w-5 text-warm-400" />
          )}
        </div>
      </button>

      {/* Question List */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isCollapsed ? "max-h-0" : "max-h-[600px]"
        )}
      >
        <div className="max-h-[500px] overflow-y-auto border-t p-4">
          <ul className="space-y-3">
            {QUESTIONS.map((question) => (
              <li key={question.id} className="flex gap-3">
                <Checkbox
                  id={question.id}
                  checked={checkedQuestions.has(question.id)}
                  onCheckedChange={() => toggleQuestion(question.id)}
                  className="mt-0.5 shrink-0"
                />
                <label
                  htmlFor={question.id}
                  className={cn(
                    "cursor-pointer text-sm leading-relaxed transition-colors",
                    checkedQuestions.has(question.id)
                      ? "text-warm-400 line-through"
                      : "text-warm-700"
                  )}
                >
                  {question.text}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
