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
    .sort((a, b) => a.data.order - b.data.order);
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
