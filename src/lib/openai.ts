import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI | undefined;
};

export const openai =
  globalForOpenAI.openai ??
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

if (process.env.NODE_ENV !== "production") {
  globalForOpenAI.openai = openai;
}

// Prompt templates for the pipeline

export const PROMPTS = {
  EXTRACT_STORY: `당신은 구술 자서전 전문가입니다. 주어진 녹취록에서 자서전 작성에 필요한 핵심 정보를 추출해주세요.

다음 JSON 스키마에 맞게 정보를 추출하세요:

{
  "people": [
    {
      "name": "이름 또는 호칭",
      "relationship": "화자와의 관계",
      "description": "특징이나 성격",
      "episodes": ["관련 에피소드 요약"]
    }
  ],
  "places": [
    {
      "name": "장소명",
      "period": "시기",
      "description": "장소에 대한 묘사",
      "significance": "화자에게 가지는 의미"
    }
  ],
  "timeline": [
    {
      "period": "시기 (예: 유년기, 1970년대 초)",
      "events": ["주요 사건들"]
    }
  ],
  "themes": ["발견된 주제들 (예: 가족애, 성장, 도전)"],
  "keyEpisodes": [
    {
      "title": "에피소드 제목",
      "description": "상세 내용",
      "emotionalTone": "감정적 톤",
      "timestamps": ["관련 녹취록 타임스탬프"]
    }
  ],
  "missingInfo": ["자서전 완성을 위해 추가로 필요한 정보"],
  "suggestedQuestions": ["추가 인터뷰 질문 제안"]
}

녹취록:
{{transcript}}

위 스키마에 맞게 정확하게 JSON만 응답해주세요.`,

  WRITE_DRAFT: `당신은 따뜻하고 문학적인 한국어 자서전 작가입니다.
주어진 정보를 바탕으로 약 10페이지 분량의 자서전 초안을 작성해주세요.

작성 지침:
1. 1인칭 시점으로 작성 (화자가 직접 이야기하는 듯한 어조)
2. 따뜻하고 회고적인 문학적 톤 유지
3. 녹취록의 내용에 충실하되, 자연스러운 문장으로 다듬기
4. 각 단락 끝에 출처 타임스탬프 표시: [MM:SS–MM:SS]
5. 추론한 내용이나 불확실한 부분은 {불확실} 배지로 표시
6. 구조: 서문 → 탄생과 가족 → 어린 시절 추억 → 중요한 인물들 → 성장의 의미

추출된 이야기 정보:
{{story}}

원본 녹취록:
{{transcript}}

JSON 형식으로 응답해주세요:
{
  "title": "자서전 제목",
  "chapters": [
    {
      "title": "장 제목",
      "content": "장 내용 (마크다운 형식)",
      "citations": ["타임스탬프 목록"],
      "uncertainParts": ["불확실한 부분 설명"]
    }
  ],
  "wordCount": 예상_단어수,
  "summary": "전체 요약"
}`,

  REGENERATE_SECTION: `당신은 자서전 작가입니다. 기존 섹션을 다음 피드백을 반영하여 다시 작성해주세요.

기존 섹션:
{{section}}

피드백/요청:
{{feedback}}

원본 정보:
{{context}}

동일한 형식과 톤을 유지하면서 개선된 버전을 작성해주세요.`,
};

// JSON Schemas for validation
export const SCHEMAS = {
  extractedStory: {
    type: "object",
    properties: {
      people: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            relationship: { type: "string" },
            description: { type: "string" },
            episodes: { type: "array", items: { type: "string" } },
          },
          required: ["name", "relationship"],
        },
      },
      places: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            period: { type: "string" },
            description: { type: "string" },
            significance: { type: "string" },
          },
          required: ["name"],
        },
      },
      timeline: {
        type: "array",
        items: {
          type: "object",
          properties: {
            period: { type: "string" },
            events: { type: "array", items: { type: "string" } },
          },
          required: ["period", "events"],
        },
      },
      themes: { type: "array", items: { type: "string" } },
      keyEpisodes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            emotionalTone: { type: "string" },
            timestamps: { type: "array", items: { type: "string" } },
          },
          required: ["title", "description"],
        },
      },
      missingInfo: { type: "array", items: { type: "string" } },
      suggestedQuestions: { type: "array", items: { type: "string" } },
    },
    required: ["people", "places", "keyEpisodes", "themes"],
  },
};

export default openai;
