import { getCollection } from 'astro:content';

export async function getWorksByStudent(studentId: string) {
  const works = await getCollection('works');
  return works.filter(work =>
    work.data.students.some(s => s.id === studentId)
  ).sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
}

export async function getWorksByEvent(eventId: string) {
  const works = await getCollection('works');
  return works.filter(work =>
    work.data.events.some(e => e.id === eventId)
  ).sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
}

export async function getStudentsByEvent(eventId: string) {
  const works = await getWorksByEvent(eventId);
  const studentIds = new Set(works.flatMap(w => w.data.students.map(s => s.id)));
  const students = await getCollection('students');
  return students.filter(s => studentIds.has(s.id));
}

export async function getStudentsByProgram(programId: string) {
  const students = await getCollection('students');
  return students.filter(s => s.data.program.id === programId);
}

export async function getCelebrationEvents() {
  const events = await getCollection('events');
  return events
    .filter(e => e.data.type === 'celebration')
    .sort((a, b) => a.data.date.localeCompare(b.data.date));
}

export async function getPeopleByRole(role: string) {
  const people = await getCollection('people');
  return people
    .filter(p => p.data.role === role)
    .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
}

export async function getPeopleByCeremony(eventId: string) {
  const people = await getCollection('people');
  return people
    .filter(p => p.data.ceremony?.id === eventId)
    .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
}

export async function getStudentsByCeremony(eventId: string) {
  const students = await getCollection('students');
  return students.filter(s =>
    s.data.ceremonies?.some(c => c.id === eventId)
  );
}

export async function getAllTags() {
  const works = await getCollection('works');
  const tags = new Set<string>();
  works.forEach(w => w.data.tags?.forEach(t => tags.add(t)));
  return [...tags].sort();
}

export async function getWorksByTag(tag: string) {
  const works = await getCollection('works');
  return works
    .filter(w => w.data.tags?.includes(tag))
    .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
}

const DIVISION_ORDER = [
  'architecture',
  'design',
  'fine-arts',
  'humanities-sciences',
  'writing',
] as const;

const DIVISION_LABELS: Record<string, string> = {
  'architecture': 'Architecture',
  'design': 'Design',
  'fine-arts': 'Fine Arts',
  'humanities-sciences': 'Humanities & Sciences',
  'writing': 'Writing',
};

export interface CandidateEntry {
  id: string;
  firstName: string;
  lastName: string;
  slug: string;
  multiProgramNote: string | null;
  expectedGraduation?: string;
}

export interface CandidateGroup {
  division: string;
  divisionLabel: string;
  programs: Array<{
    programName: string;
    degreeType: string;
    students: CandidateEntry[];
  }>;
  uniqueStudentCount: number;
}

async function groupStudentsByDivision(
  students: Awaited<ReturnType<typeof getCollection<'students'>>>,
): Promise<CandidateGroup[]> {
  const programs = await getCollection('programs');
  const programMap = new Map(programs.map(p => [p.id, p.data]));

  // Map<division, Map<programKey, Array<{ student, multiProgramNote }>>>
  const divisionMap = new Map<string, Map<string, Array<{ student: typeof students[number]; multiProgramNote: string | null }>>>();
  const divisionUniqueIds = new Map<string, Set<string>>();

  for (const student of students) {
    const programEntries = [
      { programId: student.data.program.id, degreeType: student.data.degreeType },
      ...(student.data.additionalPrograms?.map(
        (p: { program: { id: string }; degreeType?: string }) => ({
          programId: p.program.id,
          degreeType: p.degreeType ?? student.data.degreeType,
        }),
      ) ?? []),
    ];
    const multiProgramNote = programEntries.length > 1
      ? (student.data.degreeLevel === 'masters' ? 'dual degree' : 'double major')
      : null;

    for (const { programId, degreeType } of programEntries) {
      const programData = programMap.get(programId);
      if (!programData) continue;

      const division = programData.division;
      if (!divisionMap.has(division)) {
        divisionMap.set(division, new Map());
        divisionUniqueIds.set(division, new Set());
      }
      divisionUniqueIds.get(division)!.add(student.id);

      const programKey = `${programData.name}|||${degreeType}`;
      const programStudents = divisionMap.get(division)!;
      if (!programStudents.has(programKey)) {
        programStudents.set(programKey, []);
      }
      programStudents.get(programKey)!.push({ student, multiProgramNote });
    }
  }

  const result: CandidateGroup[] = [];

  const sortedDivisions = [...divisionMap.keys()].sort(
    (a, b) => DIVISION_ORDER.indexOf(a as any) - DIVISION_ORDER.indexOf(b as any)
  );

  for (const division of sortedDivisions) {
    const programStudentsMap = divisionMap.get(division)!;
    const programEntries = [...programStudentsMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, studs]) => {
        const [programName, degreeType] = key.split('|||');
        return {
          programName,
          degreeType,
          students: studs
            .map(({ student, multiProgramNote }) => ({
              id: student.id,
              firstName: student.data.firstName,
              lastName: student.data.lastName,
              slug: student.data.slug,
              multiProgramNote,
              expectedGraduation: student.data.expectedGraduation,
            }))
            .sort((a, b) => a.lastName.localeCompare(b.lastName)),
        };
      });

    result.push({
      division,
      divisionLabel: DIVISION_LABELS[division] ?? division,
      programs: programEntries,
      uniqueStudentCount: divisionUniqueIds.get(division)!.size,
    });
  }

  return result;
}

export async function getAllStudentsGroupedByDivision(): Promise<CandidateGroup[]> {
  const students = await getCollection('students');
  return groupStudentsByDivision(students);
}

export async function getCandidatesGroupedByDivision(eventId: string): Promise<CandidateGroup[]> {
  const students = await getStudentsByCeremony(eventId);
  return groupStudentsByDivision(students);
}
