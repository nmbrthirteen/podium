import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import type { Question } from '@/lib/db/schema';

export function HardestQuestions({ talkId, questions }: { talkId: string; questions: Question[] }) {
  const hardest = questions.filter(question => question.source === 'drill').slice(0, 3);

  return (
    <section aria-labelledby="hardest-heading" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="hardest-heading" className="font-medium">
          Hard questions
        </h3>
        <Link href={`/talks/${talkId}/practice/qa`} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
          Run the Q&A drill
        </Link>
      </div>
      {hardest.length > 0 && (
        <ol className="flex flex-col gap-2">
          {hardest.map(question => (
            <li key={question.id} className="flex flex-col gap-1 rounded-xl bg-inset px-4 py-3">
              <p className="font-medium">{question.question}</p>
              <p className="text-muted">
                {[question.answer, question.example, question.relevance].filter(Boolean).join(' ') || 'No answer saved'}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
