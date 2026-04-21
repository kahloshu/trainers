import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const TRAINERS = [
  { id:"1", name:"김민준", specialty:"퍼스널 트레이닝", career_years:7, short_bio:"몸의 변화보다 습관의 변화를 만들어 드립니다.", introduction:"10년간 국가대표 선수 출신의 트레이너로, 기능성 훈련과 체형 교정을 전문으로 합니다.", career:["前 국가대표 트레이닝 코치","現 제임스짐 소속 7년차"], certifications:["생활스포츠지도사 2급","NSCA-CPT 자격 보유"], tags:["근력 향상","체형 교정","재활 트레이닝"], rating_avg:4.9, review_count:23, profile_image:"", featured:false },
  { id:"2", name:"박서연", specialty:"다이어트 · 필라테스", career_years:5, short_bio:"지속 가능한 몸을 함께 만들어 갑니다.", introduction:"무리하지 않으면서도 확실히 변화하는 방법을 알고 있습니다.", career:["現 제임스짐 소속 5년차"], certifications:["생활스포츠지도사 2급","필라테스 지도자 1급","식품영양학과 졸업"], tags:["다이어트","필라테스","체형 교정"], rating_avg:4.7, review_count:18, profile_image:"", featured:false },
  { id:"3", name:"이강훈", specialty:"기능성 트레이닝", career_years:9, short_bio:"운동이 삶의 일부가 될 수 있도록 돕겠습니다.", introduction:"스포츠 과학을 기반으로 한 기능성 트레이닝 전문 트레이너입니다.", career:["現 제임스짐 소속 9년차"], certifications:["체육학 학사","CSCS 공인 전문 트레이너","KPTI 기능성 트레이닝 강사"], tags:["근력 향상","재활 트레이닝","체력 증진"], rating_avg:4.8, review_count:41, profile_image:"", featured:false },
  { id:"4", name:"최유진", specialty:"여성 전문 트레이닝", career_years:4, short_bio:"작은 변화가 쌓여 큰 결과를 만듭니다.", introduction:"여성 체형의 특성을 깊이 이해하고 프로그램을 운영합니다.", career:["現 제임스짐 소속 4년차"], certifications:["생활스포츠지도사 2급","필라테스 지도자 자격","산전산후 운동 전문 과정 수료"], tags:["다이어트","필라테스","체형 교정"], rating_avg:4.6, review_count:12, profile_image:"", featured:false },
  { id:"5", name:"정동현", specialty:"재활 · 체형 교정", career_years:11, short_bio:"통증 없이, 오래 운동할 수 있는 몸을 만듭니다.", introduction:"스포츠 재활 분야에서 11년을 전문적으로 활동해 온 트레이너입니다.", career:["병원 연계 재활 트레이닝 5년","現 제임스짐 소속 11년차"], certifications:["운동처방사 자격","스포츠 재활 전문 과정 수료"], tags:["재활 트레이닝","체형 교정","근력 향상"], rating_avg:5.0, review_count:37, profile_image:"", featured:false },
  { id:"6", name:"한수빈", specialty:"체력 증진 · 다이어트", career_years:3, short_bio:"처음 시작하는 분들을 가장 잘 압니다.", introduction:"운동을 처음 시작하는 분들에게 낯설지 않은 환경과 속도를 제공합니다.", career:["現 제임스짐 소속 3년차"], certifications:["생활스포츠지도사 2급","퍼스널 트레이너 전문 과정 수료"], tags:["다이어트","체력 증진"], rating_avg:4.5, review_count:8, profile_image:"", featured:false },
];

const REVIEWS = [
  { id:"r1",  trainer_id:"1", author_masked:"이*영", rating:5, comment:"정말 꼼꼼하게 봐주세요. 자세 교정부터 세세하게 챙겨주셔서 좋았습니다." },
  { id:"r2",  trainer_id:"1", author_masked:"박*준", rating:5, comment:"처음이라 긴장했는데 편하게 설명해 주셔서 좋았어요." },
  { id:"r3",  trainer_id:"1", author_masked:"최*호", rating:5, comment:"운동 목적에 맞게 프로그램을 잘 구성해 주셨습니다." },
  { id:"r4",  trainer_id:"2", author_masked:"김*연", rating:5, comment:"부드럽게 시작할 수 있어서 부담이 없었어요." },
  { id:"r5",  trainer_id:"2", author_masked:"이*현", rating:4, comment:"친절하고 체계적으로 알려주십니다. 다음에도 신청할 것 같아요." },
  { id:"r6",  trainer_id:"3", author_masked:"정*우", rating:5, comment:"기능성 훈련의 개념부터 잘 설명해 주셔서 이해하기 쉬웠습니다." },
  { id:"r7",  trainer_id:"3", author_masked:"한*진", rating:5, comment:"오래된 허리 통증이 나아지는 느낌입니다." },
  { id:"r8",  trainer_id:"3", author_masked:"오*수", rating:4, comment:"전문적이고 신뢰가 갑니다." },
  { id:"r9",  trainer_id:"4", author_masked:"장*민", rating:5, comment:"여성 트레이닝에 특화되어 있어서 편안했습니다." },
  { id:"r10", trainer_id:"5", author_masked:"류*훈", rating:5, comment:"무릎 통증이 있었는데 안전하게 운동할 수 있었습니다." },
  { id:"r11", trainer_id:"5", author_masked:"윤*경", rating:5, comment:"재활 전문이라 믿고 맡길 수 있었어요." },
  { id:"r12", trainer_id:"6", author_masked:"강*혁", rating:5, comment:"처음인데 전혀 어렵지 않게 안내해 주셨어요." },
];

const APPLICATIONS = [
  { applicant_name:"이*영", applicant_phone:"010-****-5678", trainer_id:"1", trainer_name:"김민준", purposes:["다이어트","근력 향상"], preferred_days:["weekday","saturday"], preferred_times:["morning","afternoon"], user_message:"허리 디스크 병력 있습니다.", admin_note:"", status:"pending" },
  { applicant_name:"박*준", applicant_phone:"010-****-2341", trainer_id:"2", trainer_name:"박서연", purposes:["체형 교정"], preferred_days:["weekday"], preferred_times:["evening"], user_message:"", admin_note:"", status:"pending" },
  { applicant_name:"최*호", applicant_phone:"010-****-9012", trainer_id:"3", trainer_name:"이강훈", purposes:["체력 증진"], preferred_days:["saturday","sunday"], preferred_times:["morning"], user_message:"", admin_note:"트레이너에게 전달 완료.", status:"confirmed" },
  { applicant_name:"정*민", applicant_phone:"010-****-3344", trainer_id:"5", trainer_name:"정동현", purposes:["재활·통증"], preferred_days:["weekday"], preferred_times:["afternoon"], user_message:"무릎 통증으로 계단 오르기가 힘듭니다.", admin_note:"", status:"pending" },
  { applicant_name:"한*진", applicant_phone:"010-****-5566", trainer_id:"1", trainer_name:"김민준", purposes:["근력 향상"], preferred_days:["weekday"], preferred_times:["morning"], user_message:"", admin_note:"3월 15일 오전 10시 확정.", status:"confirmed" },
  { applicant_name:"오*수", applicant_phone:"010-****-7788", trainer_id:"4", trainer_name:"최유진", purposes:["다이어트","필라테스"], preferred_days:["saturday"], preferred_times:["afternoon","evening"], user_message:"", admin_note:"", status:"completed" },
  { applicant_name:"류*훈", applicant_phone:"010-****-9900", trainer_id:"5", trainer_name:"정동현", purposes:["재활·통증"], preferred_days:["weekday"], preferred_times:["morning","afternoon"], user_message:"어깨 충돌 증후군 진단 받았습니다.", admin_note:"의사 소견서 확인 필요.", status:"completed" },
  { applicant_name:"강*혁", applicant_phone:"010-****-1122", trainer_id:"6", trainer_name:"한수빈", purposes:["체력 증진"], preferred_days:["sunday"], preferred_times:["afternoon"], user_message:"", admin_note:"", status:"cancelled" },
];

export async function GET() {
  // 트레이너
  const { count: trainerCount } = await supabase
    .from("trainers").select("*", { count: "exact", head: true });

  if ((trainerCount ?? 0) === 0) {
    const { error } = await supabase.from("trainers").insert(TRAINERS);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 리뷰
  const { count: reviewCount } = await supabase
    .from("reviews").select("*", { count: "exact", head: true });

  if ((reviewCount ?? 0) === 0) {
    const { error } = await supabase.from("reviews").insert(REVIEWS);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 신청 내역
  const { count: appCount } = await supabase
    .from("applications").select("*", { count: "exact", head: true });

  if ((appCount ?? 0) === 0) {
    const { error } = await supabase.from("applications").insert(APPLICATIONS);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    seeded: { trainers: trainerCount === 0, reviews: reviewCount === 0, applications: appCount === 0 }
  });
}
