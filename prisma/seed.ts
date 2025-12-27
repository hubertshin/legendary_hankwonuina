import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  let adminUser = await prisma.user.findUnique({
    where: { email: "admin@1book1me.com" },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: "admin@1book1me.com",
        name: "관리자",
        role: "ADMIN",
      },
    });
    console.log("Created admin user:", adminUser.email);
  } else {
    console.log("Admin user already exists:", adminUser.email);
  }

  // Create demo user
  let demoUser = await prisma.user.findUnique({
    where: { email: "demo@1book1me.com" },
  });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        email: "demo@1book1me.com",
        name: "데모 사용자",
        role: "USER",
      },
    });
    console.log("Created demo user:", demoUser.email);
  } else {
    console.log("Demo user already exists:", demoUser.email);
  }

  // Check if demo project exists
  let demoProject = await prisma.project.findFirst({
    where: {
      userId: demoUser.id,
      title: "나의 어린 시절 이야기",
    },
  });

  if (!demoProject) {
    demoProject = await prisma.project.create({
      data: {
        userId: demoUser.id,
        title: "나의 어린 시절 이야기",
        status: "COMPLETED",
      },
    });
    console.log("Created demo project:", demoProject.title);

    // Create sample draft
    const sampleChapters = [
      {
        title: "서문: 기억의 시작",
        content: `나는 1975년 따스한 봄날, 경상남도 밀양의 작은 마을에서 태어났다. 어머니께서 들려주신 이야기에 따르면, 그날 밤 유난히 밝은 보름달이 하늘에 떠 있었다고 한다.

"네가 태어나던 날, 마을 어르신들이 모두 좋은 아이가 태어날 것이라 했단다."

어머니의 목소리가 아직도 귀에 생생하다. [00:01:23–00:01:45]`,
        citations: ["00:01:23–00:01:45"],
        uncertainParts: [],
      },
      {
        title: "1장: 우리 집",
        content: `우리 집은 마을 끝자락에 있는 작은 기와집이었다. 대문을 열고 들어서면 작은 마당이 나오고, 그 뒤로 본채와 안채가 있었다.

여름이면 마당에 물을 뿌려 시원하게 하고, 그 위에 돗자리를 깔아 별을 보며 잠들곤 했다. {불확실} 할머니께서 부채로 부치시던 바람의 감촉이 아직도 느껴지는 듯하다.

부엌에서 풍겨오던 된장찌개 냄새, 아버지께서 마당에서 톱질하시던 소리, 어머니의 다듬잇돌 소리... 그 모든 것들이 내 어린 시절을 이루고 있다. [00:03:12–00:04:30]`,
        citations: ["00:03:12–00:04:30"],
        uncertainParts: ["할머니 관련 내용은 추론됨"],
      },
      {
        title: "2장: 가족들",
        content: `우리 가족은 할머니, 부모님, 그리고 나와 두 살 터울의 누나까지 다섯 식구였다. 아버지는 마을에서 작은 정미소를 운영하셨고, 어머니는 집안일과 밭일을 도맡아 하셨다.

누나는 나보다 의젓하고 어른스러웠다. 어릴 때 내가 울면 항상 달래주었고, 맛있는 것이 생기면 먼저 나에게 건네주곤 했다.

"동생아, 이거 먹어. 내가 더 먹으면 배가 아플 것 같아."

누나의 그런 말들이 나중에야 배려였음을 알게 되었다. [00:05:00–00:06:15]`,
        citations: ["00:05:00–00:06:15"],
        uncertainParts: [],
      },
    ];

    await prisma.draft.create({
      data: {
        projectId: demoProject.id,
        version: 1,
        title: "나의 어린 시절 이야기",
        chapters: sampleChapters,
        content: sampleChapters.map((c) => c.content).join("\n\n"),
        wordCount: 850,
        pageCount: 3,
        isActive: true,
      },
    });

    console.log("Created sample draft");
  } else {
    console.log("Demo project already exists:", demoProject.title);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
