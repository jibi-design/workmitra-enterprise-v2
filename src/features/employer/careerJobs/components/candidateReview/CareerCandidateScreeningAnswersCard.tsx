// App name: Job Mitra
// File name: CareerCandidateScreeningAnswersCard.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\candidateReview\CareerCandidateScreeningAnswersCard.tsx

import type { CareerApplication, CareerJobPost } from "../../types/careerTypes";
import { formatReviewQuestionText } from "./careerCandidateReviewFormatters";
import { CAREER_REVIEW_BLUE_DEEP, CAREER_REVIEW_TEXT } from "./careerCandidateReviewTheme";
import { AnswerPill, BodyText, ReviewCard } from "./careerCandidateReviewUi";

type CareerCandidateScreeningAnswersCardProps = {
  app: CareerApplication;
  post: CareerJobPost;
};

export function CareerCandidateScreeningAnswersCard({
  app,
  post,
}: CareerCandidateScreeningAnswersCardProps) {
  const screeningQuestions = post.screeningQuestions ?? [];

  return (
    <ReviewCard
      title="Screening answers"
      subtitle="Candidate responses to employer screening questions. Manual review is still required."
    >
      {screeningQuestions.length === 0 ? (
        <BodyText value="No screening questions were added to this post." />
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {screeningQuestions.map((question, index) => {
            const answer = app.screeningAnswers?.[question.id] ?? "no";

            return (
              <div
                key={question.id}
                style={{
                  padding: "10px",
                  borderRadius: 16,
                  border: "1px solid rgba(148,163,184,0.13)",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.9))",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                    gap: 8,
                    alignItems: "start",
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      background: "rgba(29,78,216,0.08)",
                      border: "1px solid rgba(29,78,216,0.12)",
                      color: CAREER_REVIEW_BLUE_DEEP,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 950,
                    }}
                  >
                    {index + 1}
                  </div>

                  <div
                    style={{
                      fontSize: 11.8,
                      fontWeight: 850,
                      color: CAREER_REVIEW_TEXT,
                      lineHeight: 1.4,
                    }}
                  >
                    {formatReviewQuestionText(question.text)}
                  </div>

                  <AnswerPill answer={answer} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ReviewCard>
  );
}
