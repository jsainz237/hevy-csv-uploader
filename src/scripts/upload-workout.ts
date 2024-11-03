import axios from "axios";
import parseArgs from "minimist";
import { readFile } from "fs/promises";
import Papa from "papaparse";
import dotenv from "dotenv";

dotenv.config();

const args = parseArgs(process.argv.slice(2));
const file = args._[0];

const hevyApi = axios.create({
  baseURL: 'https://api.hevyapp.com/v1',
  headers: {
    'Accept': 'application/json',
    'api-key': process.env.HEVY_API_KEY as string
  }
});

async function parseCSV(file: string) {
  const data = await readFile(file, "utf-8");
  const result = Papa.parse(data, { header: true, dynamicTyping: true });
  return result.data;
}

function getDurationSeconds(duration: string) {
  if (!duration) return null;

  const durationMins = parseInt(duration.split(':')[0]);
  const durationSeconds = parseInt(duration.split(':')[1]);
  return durationMins * 60 + durationSeconds;
}

function mapExercise(exercise: any) {
  const {
    'Template ID': templateId,
    Sets: sets,
    Reps: reps,
    Duration: duration,
    "Rest Time": rest,
    Notes: notes,
    Superset: superset
  } = exercise;

  const restTimeSeconds = getDurationSeconds(rest);
  const durationSeconds = getDurationSeconds(duration);

  const repCount = (() => {
    if (!reps) return null;
    if (reps.includes('-')) return parseInt(reps.split('-')[0]);
    return parseInt(reps);
  })();

  return {
    exercise_template_id: templateId,
    notes: notes,
    superset_id: superset,
    rest_seconds: restTimeSeconds,
    sets: Array.from({ length: sets }, () => ({
      type: "normal",
      reps: repCount,
      duration_seconds: durationSeconds,
    }))
  }
}

async function fetchFolders() {
  const response = await hevyApi.get('/routine_folders', {
    params: { page: 1, pageSize: 10 },
  });

  return response.data.routine_folders;
}

async function uploadWorkout(props: {
  title: string;
  folderId?: string;
  exercises: any[];
}) {
  const { title, folderId: folder_id, exercises } = props;
  const response = await hevyApi.post('/routines', {
    routine: {
      title,
      folder_id,
      exercises
    }
  });

  return response.data;
}

(async () => {
  const data = await parseCSV(file);
  const stretching = await parseCSV('src/workouts/Stretching Default.csv');

  const filesplit = file.split('/');
  const folder = filesplit[filesplit.length - 2];
  const title = filesplit[filesplit.length - 1].split('.')[0];

  const folders = await fetchFolders();
  const folderId = folders.find((f: any) => f.title === folder)?.id;

  if (!folder || !title || !folderId) {
    console.error('Folder or title not found');
    process.exit(1);
  }

  const exercises = [...stretching, ...data].map(mapExercise);
  const routine = await uploadWorkout({ title, folderId, exercises });
  console.log(routine);
})();
