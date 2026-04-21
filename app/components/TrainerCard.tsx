import Link from "next/link";
import type { Trainer } from "@/app/data/trainers";

type Props = { trainer: Trainer };

function InitialAvatar({ name }: { name: string }) {
  const gradients = [
    "linear-gradient(135deg, #0a1628 0%, #1a3a8a 100%)",
    "linear-gradient(135deg, #0a1e14 0%, #1a5a3a 100%)",
    "linear-gradient(135deg, #160a28 0%, #3a1a6a 100%)",
    "linear-gradient(135deg, #280a0a 0%, #6a1a1a 100%)",
    "linear-gradient(135deg, #1e1e0a 0%, #5a5a1a 100%)",
    "linear-gradient(135deg, #0a1e1e 0%, #1a5a5a 100%)",
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: gradients[idx] }}
    >
      <span className="text-5xl font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.85)" }}>
        {name.charAt(0)}
      </span>
    </div>
  );
}

export default function TrainerCard({ trainer }: Props) {
  return (
    <div
      className="mx-4 rounded-2xl overflow-hidden"
      style={{ background: "#1a1a1a" }}
    >
      {/* 프로필 이미지 */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        {trainer.profileImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={trainer.profileImage} alt={trainer.name} className="w-full h-full object-cover" />
        ) : (
          <InitialAvatar name={trainer.name} />
        )}

        {/* 평점 뱃지 */}
        <div
          className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{ background: "rgba(14,14,14,0.75)", backdropFilter: "blur(24px)" }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#c9a96e">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-[12px] font-semibold" style={{ color: "#c9a96e" }}>
            {trainer.ratingAvg.toFixed(1)}
          </span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
          <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>
            후기 {trainer.reviewCount}건
          </span>
        </div>

        {/* 상위 노출 뱃지 */}
        {trainer.featured && (
          <div
            className="absolute top-3 left-3 flex items-center rounded-full px-2.5"
            style={{
              height: 22,
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
              boxShadow: "0 2px 8px rgba(251,191,36,0.35)",
            }}
          >
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase leading-none" style={{ color: "#000" }}>
              NEW TRAINER
            </span>
          </div>
        )}

        {/* 경력 뱃지 */}
        <div
          className="absolute top-3 right-3 flex items-center rounded-full px-2.5"
          style={{ height: 22, background: "rgba(14,14,14,0.65)", backdropFilter: "blur(24px)" }}
        >
          <span className="text-[11px] font-medium tracking-[0.05em] uppercase leading-none" style={{ color: "rgba(255,255,255,0.8)" }}>
            {trainer.careerYears}yr
          </span>
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="px-4 pt-4 pb-4" style={{ background: "#1a1a1a" }}>
        {/* 전문분야 오버라인 */}
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-1.5" style={{ color: "#2F6BFF" }}>
          {trainer.specialty}
        </p>

        {/* 이름 */}
        <h3 className="text-[18px] font-bold tracking-tight mb-3" style={{ color: "#ffffff" }}>
          {trainer.name} 트레이너
        </h3>

        {/* 한줄 소개 */}
        <p
          className="text-[13px] leading-relaxed mb-3 pl-3 italic"
          style={{ color: "#a0a0a0", borderLeft: "2px solid rgba(47,107,255,0.3)" }}
        >
          &ldquo;{trainer.shortBio}&rdquo;
        </p>

        {/* 태그 */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {trainer.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full tracking-[0.03em]"
              style={{ background: "rgba(47,107,255,0.10)", color: "#2F6BFF" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* OT 신청 버튼 */}
        <Link href={`/trainer/${trainer.id}/apply`} className="btn-primary">
          <span>OT 신청하기</span>
        </Link>

        {/* 상세 보기 */}
        <Link
          href={`/trainer/${trainer.id}`}
          className="flex items-center justify-center w-full mt-2.5 py-2 text-[13px] font-medium transition-colors active:opacity-70"
          style={{ color: "#5a5a5a" }}
        >
          트레이너 자세히 보기
        </Link>
      </div>
    </div>
  );
}
