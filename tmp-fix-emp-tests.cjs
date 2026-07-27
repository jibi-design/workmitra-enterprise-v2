const fs = require("fs");
const paths = [
  "src/shared/employment/__tests__/employmentActions.test.ts",
  "src/shared/employment/__tests__/forceComplete.test.ts",
];

for (const p of paths) {
  let s = fs.readFileSync(p, "utf8");
  s = s.replace(/it\((['"])([^'"]+)\1,\s*\(\)\s*=>\s*\{/g, "it($1$2$1, async () => {");
  s = s.replace(/(?<!await )employmentActions\./g, "await employmentActions.");
  s = s.replace(
    /return await employmentActions\.markAsJoined\(([^)]+)\)!/g,
    "return (await employmentActions.markAsJoined($1))!",
  );
  s = s.replace(/function seedWorking\(/g, "async function seedWorking(");
  s = s.replace(/function joinWorking\(/g, "async function joinWorking(");
  s = s.replace(/function makeWorking\(/g, "async function makeWorking(");
  // Callers of seedWorking/joinWorking need await
  s = s.replace(/(?<!await )seedWorking\(/g, "await seedWorking(");
  s = s.replace(/(?<!await )joinWorking\(/g, "await joinWorking(");
  s = s.replace(/(?<!await )makeWorking\(/g, "await makeWorking(");
  fs.writeFileSync(p, s);
  console.log("updated", p);
}
